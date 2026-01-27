"use client";

import { useRef, useState } from "react";

const OUTPUT_WIDTH = 370;
const OUTPUT_HEIGHT = 320; // 370 x 320 PNG (LINE static sticker max)

export default function Home() {
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canSave = !!imageUrl && !loading;

  async function handleGenerate() {
    setStatus("生成中…");
    setLoading(true);

    if (imageUrl && imageUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imageUrl);
      } catch {}
    }

    setImageUrl(null);

    try {
      const params = new URLSearchParams({
        message: message ?? "",
        keyword: keyword ?? "",
      });

      const res = await fetch(`/api/generate?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const raw = await res.text();
        console.error("Generate error raw:", raw);
        let msg = `生成に失敗しました (status ${res.status})`;
        if (raw) {
          try {
            const body = JSON.parse(raw);
            if (body && typeof (body as any).error === "string") {
              msg = `エラー: ${(body as any).error}`;
            } else {
              msg = msg + ": " + raw.slice(0, 80);
            }
          } catch {
            msg = msg + ": " + raw.slice(0, 80);
          }
        }
        setStatus(msg);
        return;
      }
      const promptText = await res.text();

      const ts = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const filename = `prompt-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(
        ts.getDate()
      )}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.txt`;

      const blob = new Blob([promptText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      setStatus("プロンプトをファイルに出力しました");
    } catch (e) {
      console.error(e);
      setStatus("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!imageUrl) return;
    setStatus("保存用画像を作成中…");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
    });

    const canvas = canvasRef.current || (canvasRef.current = document.createElement("canvas"));
    const width = OUTPUT_WIDTH;
    const height = OUTPUT_HEIGHT;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setStatus("エラー: canvas が利用できません");
      return;
    }

    // 透過背景のまま出力する（canvas はデフォルトで透明）
    ctx.clearRect(0, 0, width, height);

    // 元画像を縦横比維持で 370×320 内にフィットさせる
    const srcW = img.width;
    const srcH = img.height;
    const scale = Math.min(width / srcW, height / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;

    ctx.drawImage(img, dx, dy, drawW, drawH);

    const pngData = canvas.toDataURL("image/png");

    // 保存ファイル名を 01.png, 02.png... の連番にする
    let seq = 1;
    try {
      const key = "ai-stamp-download-seq";
      const prev = Number(localStorage.getItem(key) || "0");
      seq = Number.isFinite(prev) ? prev + 1 : 1;
      localStorage.setItem(key, String(seq));
    } catch {
      // localStorage が使えない場合は 01.png
      seq = 1;
    }
    const filename = `${String(seq).padStart(2, "0")}.png`;

    const a = document.createElement("a");
    a.href = pngData;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setStatus(`保存しました（${width}×${height}）`);
  }

  return (
    <div className="app-root">
      <div className="card">
        <div className="header">
          <div className="title">AI-Stamp</div>
          <div className="version">v3.2.007</div>
        </div>

        <div className="row">
          <label>Message</label>
          <input
            maxLength={20}
            placeholder="PayPay銀行へ入金よろしく"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="row">
          <label>Keyword</label>
          <textarea
            rows={2}
            placeholder="麦色の毛の猫 など"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="preview">
          <div className="preview-inner">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="preview" />
            ) : (
              <span style={{ fontSize: 12, color: "#bbb" }}>ここにプレビューが表示されます</span>
            )}
          </div>
        </div>

        <div style={{ fontSize: 10, color: "#999", textAlign: "right" }}>
          出力サイズ（保存）: {OUTPUT_WIDTH} × {OUTPUT_HEIGHT}
        </div>

        <div className="buttons">
          <button className="primary-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? "生成中…" : "生成"}
          </button>
          <button
            className={`secondary-btn${canSave ? " save-enabled" : ""}`}
            onClick={handleSave}
            disabled={!canSave}
          >
            保存
          </button>
        </div>

        <div className="status">{status}</div>
      </div>
    </div>
  );
}
