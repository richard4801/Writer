import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(mode: string, project: {
  title: string;
  genre: string;
  synopsis: string;
  styleNotes: string;
  characters: string;
  worldNotes: string;
}) {
  const context = [
    project.title && `Title: ${project.title}`,
    project.genre && `Genre: ${project.genre}`,
    project.synopsis && `Synopsis: ${project.synopsis}`,
    project.styleNotes && `Style notes: ${project.styleNotes}`,
    project.characters && `Characters: ${project.characters}`,
    project.worldNotes && `World/setting notes: ${project.worldNotes}`,
  ].filter(Boolean).join("\n");

  const modeInstructions: Record<string, string> = {
    draft: `You are a creative writing partner helping the author draft new prose. Write fluidly and naturally in the established style. Continue the narrative voice without meta-commentary. Produce prose, not instructions.`,
    edit: `You are a meticulous literary editor. When given text, return a revised version that improves clarity, pacing, and prose quality while preserving the author's voice. Show only the edited text, no commentary.`,
    brainstorm: `You are a creative collaborator helping the author explore ideas. Offer vivid suggestions, alternative directions, and imaginative possibilities. Be generative and expansive. Use plain prose, no bullet-point lists unless the author asks.`,
  };

  return [
    modeInstructions[mode] ?? modeInstructions.draft,
    context && `\n\nProject context:\n${context}`,
  ].filter(Boolean).join("");
}

export async function POST(req: Request) {
  const { messages, mode, project, sceneContext } = await req.json();

  const systemPrompt = buildSystemPrompt(mode, project);

  const apiMessages = [
    ...(sceneContext
      ? [{ role: "user" as const, content: `Current scene text:\n\n${sceneContext}` }, { role: "assistant" as const, content: "I have read the current scene. How can I help?" }]
      : []),
    ...messages,
  ];

  const stream = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: systemPrompt,
    messages: apiMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
