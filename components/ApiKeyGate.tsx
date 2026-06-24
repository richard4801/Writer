"use client";
import { useState } from "react";
import { setApiKey } from "@/lib/claude";

interface Props {
  onSaved: () => void;
}

export default function ApiKeyGate({ onSaved }: Props) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  function save() {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("That doesn't look like an Anthropic API key (should start with sk-ant-).");
      return;
    }
    setApiKey(trimmed);
    onSaved();
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#faf9f7]">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-semibold mb-2 font-sans">✦ Writer</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed font-sans">
          Your personal AI writing studio. Enter your Anthropic API key to get started —
          it’s stored only in your browser and never sent anywhere except directly to Anthropic.
        </p>

        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 font-sans">
          Anthropic API key
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="sk-ant-…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 mb-1"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        <button
          onClick={save}
          disabled={!key.trim()}
          className="w-full mt-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors font-sans"
        >
          Start writing
        </button>

        <p className="text-xs text-gray-400 mt-4 font-sans">
          Get a key at{" "}
          <span className="font-mono">console.anthropic.com</span>
        </p>
      </div>
    </div>
  );
}
