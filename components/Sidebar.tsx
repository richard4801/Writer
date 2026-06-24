"use client";
import { Plus, BookOpen, Settings } from "lucide-react";
import type { Project, Chapter, Scene } from "@/lib/types";

interface SidebarProps {
  project: Project | null;
  activeChapterId: string | null;
  activeSceneId: string | null;
  onSelectScene: (chapterId: string, sceneId: string) => void;
  onAddChapter: () => void;
  onAddScene: () => void;
  onOpenSettings: () => void;
  totalWords: number;
}

export default function Sidebar({
  project,
  activeChapterId,
  activeSceneId,
  onSelectScene,
  onAddChapter,
  onAddScene,
  onOpenSettings,
  totalWords,
}: SidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 bg-[#f3f2ef] border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-gray-500" />
          <span className="font-semibold text-sm truncate">{project?.title ?? "…"}</span>
        </div>
        <p className="text-xs text-gray-400">{totalWords.toLocaleString()} words</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {project?.chapters.map((chapter: Chapter) => (
          <div key={chapter.id} className="mb-2">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase tracking-wide">
              {chapter.title}
            </div>
            {chapter.scenes.map((scene: Scene) => (
              <button
                key={scene.id}
                onClick={() => onSelectScene(chapter.id, scene.id)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm truncate transition-colors ${
                  activeChapterId === chapter.id && activeSceneId === scene.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                }`}
              >
                {scene.title}
                {scene.wordCount > 0 && (
                  <span className="ml-1 text-xs text-gray-400">{scene.wordCount}w</span>
                )}
              </button>
            ))}
            {activeChapterId === chapter.id && (
              <button
                onClick={onAddScene}
                className="w-full text-left px-3 py-1 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <Plus size={12} /> Add scene
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAddChapter}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-2"
        >
          <Plus size={14} /> Add chapter
        </button>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <Settings size={14} /> Project settings
        </button>
      </div>
    </aside>
  );
}
