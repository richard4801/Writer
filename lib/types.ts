export type WritingMode = "draft" | "edit" | "brainstorm";

export interface Scene {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  styleNotes: string;
  characters: string;
  worldNotes: string;
  chapters: Chapter[];
  createdAt: number;
  updatedAt: number;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}
