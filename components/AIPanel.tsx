"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { streamWrite } from "@/lib/claude";
import type { WritingMode, AIMessage, Project } from "@/lib/types";

interface AIPanelProps {
  mode: WritingMode;
  project: Project | null;
  sceneContent: string;
  onInsert: (text: string) => void;
}

const MODE_PLACEHOLDERS: Record<WritingMode, string> = {
  draft: "Ask Claude to continue the scene, write dialogue, describe a setting…",
  edit: "Paste text here to edit, or describe what to improve…",
  brainstorm: "Ask for plot ideas, character backstory, what-ifs…",
};

export default function AIPanel({ mode, project, sceneContent, onInsert }: AIPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg: AIMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setStreamBuffer("");

    try {
      const full = await streamWrite({
        messages: nextMessages,
        mode,
        project: {
          title: project?.title ?? "",
          genre: project?.genre ?? "",
          synopsis: project?.synopsis ?? "",
          styleNotes: project?.styleNotes ?? "",
          characters: project?.characters ?? "",
          worldNotes: project?.worldNotes ?? "",
        },
        sceneContext: sceneContent,
        onChunk: (text) => setStreamBuffer(text),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setStreaming(false);
      setStreamBuffer("");
    }
  }

  return (
    <div className="w-80 flex-shrink-0 border-l border-gray-200 flex flex-col bg-white h-full">
      <div className="p-3 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Claude · {mode === "draft" ? "Drafting" : mode === "edit" ? "Editing" : "Brainstorming"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 italic mt-4">{MODE_PLACEHOLDERS[mode]}</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-full text-sm rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed ${
                m.role === "user" ? "bg-blue-50 text-gray-800" : "bg-gray-50 text-gray-800"
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" && (
              <button
                onClick={() => onInsert(m.content)}
                className="mt-1 text-xs text-blue-500 hover:text-blue-700 block"
              >
                Insert into scene ↑
              </button>
            )}
          </div>
        ))}
        {streaming && streamBuffer && (
          <div className="text-left">
            <div className="inline-block max-w-full text-sm rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed bg-gray-50 text-gray-800">
              {streamBuffer}
              <span className="animate-pulse">▄</span>
            </div>
          </div>
        )}
        {streaming && !streamBuffer && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 size={14} className="animate-spin" /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-200 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask Claude…"
          rows={2}
          className="flex-1 text-sm resize-none border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 font-sans"
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="self-end p-2 rounded-lg bg-blue-500 text-white disabled:opacity-40 hover:bg-blue-600 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
