"use client";
import { useState, useCallback, useEffect } from "react";
import { useWriterStore } from "@/lib/store";
import { getApiKey, clearApiKey } from "@/lib/claude";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import AIPanel from "@/components/AIPanel";
import ModeBar from "@/components/ModeBar";
import ProjectSettings from "@/components/ProjectSettings";
import ApiKeyGate from "@/components/ApiKeyGate";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function WriterApp() {
  const store = useWriterStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingInsert, setPendingInsert] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    setHasKey(!!getApiKey());
  }, []);

  const handleInsert = useCallback((text: string) => {
    setPendingInsert(text);
    setTimeout(() => setPendingInsert(null), 100);
  }, []);

  if (hasKey === null || !store.hydrated) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!hasKey) {
    return <ApiKeyGate onSaved={() => setHasKey(true)} />;
  }

  const editorContent = pendingInsert
    ? (store.activeScene?.content ?? "") + "\n\n" + pendingInsert
    : store.activeScene?.content ?? "";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white/90 backdrop-blur-sm z-10">
        <h1 className="font-semibold text-gray-800 text-sm tracking-wide font-sans">✦ Writer</h1>
        <ModeBar mode={store.mode} onChange={store.setMode} />
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-400 font-sans">
            {store.activeScene?.wordCount ?? 0} words in scene · {store.totalWords.toLocaleString()} total
          </div>
          <button
            onClick={() => { clearApiKey(); setHasKey(false); }}
            className="text-xs text-gray-400 hover:text-gray-600 font-sans"
            title="Change API key"
          >
            API key
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          project={store.activeProject}
          activeChapterId={store.activeChapter?.id ?? null}
          activeSceneId={store.activeScene?.id ?? null}
          onSelectScene={(chapterId, sceneId) => {
            store.setActiveChapterId(chapterId);
            store.setActiveSceneId(sceneId);
          }}
          onAddChapter={store.addChapter}
          onAddScene={store.addScene}
          onOpenSettings={() => setSettingsOpen(true)}
          totalWords={store.totalWords}
        />

        <main className="flex-1 overflow-y-auto px-8 py-10 bg-[#faf9f7]">
          <div className="max-w-2xl mx-auto min-h-full">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 font-sans">
              {store.activeScene?.title}
            </div>
            <Editor
              key={store.activeScene?.id}
              content={editorContent}
              onChange={store.updateScene}
              placeholder={
                store.mode === "draft"
                  ? "Start writing, or ask Claude to draft something…"
                  : store.mode === "edit"
                  ? "Paste or write text here to edit…"
                  : "Jot down ideas and ask Claude to expand them…"
              }
            />
          </div>
        </main>

        <AIPanel
          mode={store.mode}
          project={store.activeProject}
          sceneContent={store.activeScene?.content ?? ""}
          onInsert={handleInsert}
        />
      </div>

      {settingsOpen && (
        <ProjectSettings
          project={store.activeProject}
          onUpdate={store.updateProject}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
