"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleGenerate() {
    setStatus("作成中…");
    setLoading(true);

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

  return (
    <div className="app-root">
      <div className="card">
        <div className="header">
          <div className="title">AI-Stamp-local</div>
          <div className="version">v5.0.002</div>
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

        <div className="buttons">
          <button className="primary-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? "作成中…" : "プロンプト作成"}
          </button>
        </div>

        <div className="status">{status}</div>
      </div>
    </div>
  );
}
