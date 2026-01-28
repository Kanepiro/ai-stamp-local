"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleGenerate() {
    setStatus("生成中…");
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

      // ファイル名を 00xx.txt（xx: 01〜の通し番号）にする。
      // ※フォルダ指定はブラウザ仕様上できないため、番号は localStorage に保持する。
      const SEQ_KEY = "ai-stamp-output-seq";
      let seq = Number(localStorage.getItem(SEQ_KEY) ?? "0");
      if (!Number.isFinite(seq) || seq < 0) seq = 0;
      seq += 1;
      localStorage.setItem(SEQ_KEY, String(seq));
      const filename = `${String(seq).padStart(4, "0")}.txt`;

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
          <div className="title">AI-Stamp Local</div>
          <div className="version">v4.0.003</div>
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
            {loading ? "生成中…" : "プロンプト生成"}
          </button>
        </div>

        <div className="status">{status}</div>
      </div>
    </div>
  );
}
