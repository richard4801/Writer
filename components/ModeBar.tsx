"use client";
import type { WritingMode } from "@/lib/types";

const MODES: { value: WritingMode; label: string; desc: string }[] = [
  { value: "draft", label: "Draft", desc: "Write new prose" },
  { value: "edit", label: "Edit", desc: "Polish your text" },
  { value: "brainstorm", label: "Brainstorm", desc: "Explore ideas" },
];

interface Props {
  mode: WritingMode;
  onChange: (m: WritingMode) => void;
}

export default function ModeBar({ mode, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          title={m.desc}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === m.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
