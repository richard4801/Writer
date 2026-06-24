"use client";
import { X } from "lucide-react";
import type { Project } from "@/lib/types";

interface Props {
  project: Project | null;
  onUpdate: (fields: Partial<Project>) => void;
  onClose: () => void;
}

function Field({ label, value, onChange, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 font-serif resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 font-serif"
        />
      )}
    </div>
  );
}

export default function ProjectSettings({ project, onUpdate, onClose }: Props) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-lg">Project Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Field label="Title" value={project.title} onChange={(v) => onUpdate({ title: v })} />
          <Field label="Genre" value={project.genre} onChange={(v) => onUpdate({ genre: v })} />
          <Field label="Synopsis" value={project.synopsis} onChange={(v) => onUpdate({ synopsis: v })} multiline />
          <Field label="Style notes (voice, tone, POV)" value={project.styleNotes} onChange={(v) => onUpdate({ styleNotes: v })} multiline />
          <Field label="Characters" value={project.characters} onChange={(v) => onUpdate({ characters: v })} multiline />
          <Field label="World & setting notes" value={project.worldNotes} onChange={(v) => onUpdate({ worldNotes: v })} multiline />
        </div>

        <div className="p-4 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save & close
          </button>
        </div>
      </div>
    </div>
  );
}
