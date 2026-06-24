"use client";
import { useState, useEffect, useCallback } from "react";
import type { Project, Chapter, Scene, WritingMode } from "./types";

const STORAGE_KEY = "writer_projects";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createScene(title = "New Scene"): Scene {
  return {
    id: generateId(),
    title,
    content: "",
    wordCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createChapter(title = "Chapter 1"): Chapter {
  return { id: generateId(), title, scenes: [createScene("Opening")] };
}

function createProject(title = "Untitled"): Project {
  return {
    id: generateId(),
    title,
    genre: "",
    synopsis: "",
    styleNotes: "",
    characters: "",
    worldNotes: "",
    chapters: [createChapter("Chapter 1")],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useWriterStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [mode, setMode] = useState<WritingMode>("draft");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadProjects();
    if (loaded.length === 0) {
      const p = createProject("My Novel");
      setProjects([p]);
      setActiveProjectId(p.id);
      setActiveChapterId(p.chapters[0].id);
      setActiveSceneId(p.chapters[0].scenes[0].id);
      saveProjects([p]);
    } else {
      setProjects(loaded);
      setActiveProjectId(loaded[0].id);
      setActiveChapterId(loaded[0].chapters[0].id);
      setActiveSceneId(loaded[0].chapters[0].scenes[0].id);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((updated: Project[]) => {
    setProjects(updated);
    saveProjects(updated);
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;
  const activeChapter = activeProject?.chapters.find((c) => c.id === activeChapterId) ?? null;
  const activeScene = activeChapter?.scenes.find((s) => s.id === activeSceneId) ?? null;

  const updateScene = useCallback((content: string) => {
    if (!activeProjectId || !activeChapterId || !activeSceneId) return;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
    persist(
      projects.map((p) =>
        p.id !== activeProjectId
          ? p
          : {
              ...p,
              updatedAt: Date.now(),
              chapters: p.chapters.map((c) =>
                c.id !== activeChapterId
                  ? c
                  : {
                      ...c,
                      scenes: c.scenes.map((s) =>
                        s.id !== activeSceneId
                          ? s
                          : { ...s, content, wordCount, updatedAt: Date.now() }
                      ),
                    }
              ),
            }
      )
    );
  }, [projects, activeProjectId, activeChapterId, activeSceneId, persist]);

  const updateProject = useCallback((fields: Partial<Omit<Project, "id" | "chapters" | "createdAt">>) => {
    if (!activeProjectId) return;
    persist(
      projects.map((p) =>
        p.id !== activeProjectId ? p : { ...p, ...fields, updatedAt: Date.now() }
      )
    );
  }, [projects, activeProjectId, persist]);

  const addChapter = useCallback(() => {
    if (!activeProjectId) return;
    const chapter = createChapter(`Chapter ${(activeProject?.chapters.length ?? 0) + 1}`);
    const updated = projects.map((p) =>
      p.id !== activeProjectId
        ? p
        : { ...p, chapters: [...p.chapters, chapter], updatedAt: Date.now() }
    );
    persist(updated);
    setActiveChapterId(chapter.id);
    setActiveSceneId(chapter.scenes[0].id);
  }, [projects, activeProjectId, activeProject, persist]);

  const addScene = useCallback(() => {
    if (!activeProjectId || !activeChapterId) return;
    const scene = createScene(`Scene ${(activeChapter?.scenes.length ?? 0) + 1}`);
    const updated = projects.map((p) =>
      p.id !== activeProjectId
        ? p
        : {
            ...p,
            chapters: p.chapters.map((c) =>
              c.id !== activeChapterId ? c : { ...c, scenes: [...c.scenes, scene] }
            ),
            updatedAt: Date.now(),
          }
    );
    persist(updated);
    setActiveSceneId(scene.id);
  }, [projects, activeProjectId, activeChapterId, activeChapter, persist]);

  const newProject = useCallback(() => {
    const p = createProject("Untitled");
    persist([...projects, p]);
    setActiveProjectId(p.id);
    setActiveChapterId(p.chapters[0].id);
    setActiveSceneId(p.chapters[0].scenes[0].id);
  }, [projects, persist]);

  const totalWords = activeProject?.chapters
    .flatMap((c) => c.scenes)
    .reduce((sum, s) => sum + s.wordCount, 0) ?? 0;

  return {
    hydrated,
    projects,
    activeProject,
    activeChapter,
    activeScene,
    mode,
    setMode,
    setActiveProjectId,
    setActiveChapterId: (id: string) => { setActiveChapterId(id); },
    setActiveSceneId: (id: string) => { setActiveSceneId(id); },
    updateScene,
    updateProject,
    addChapter,
    addScene,
    newProject,
    totalWords,
  };
}
