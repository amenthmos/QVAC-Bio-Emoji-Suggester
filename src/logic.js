// QVAC Bio Emoji Suggester — core logic.
// completion() suggests emoji that represent a few interests/hobbies, for
// use in a social media bio.

import { completion } from "@qvac/sdk";

// Matches one or more emoji-ish codepoints (very loose, covers most common
// emoji ranges without pulling in a full unicode emoji dependency).
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu;

function extractEmoji(text) {
  const matches = text.match(EMOJI_RE);
  if (!matches) return [];
  return [...new Set(matches)];
}

const FALLBACK_MAP = {
  travel: "✈️", hiking: "🥾", music: "🎵", reading: "📚", books: "📚",
  gaming: "🎮", games: "🎮", cooking: "🍳", food: "🍔", coffee: "☕",
  photography: "📷", fitness: "💪", gym: "💪", running: "🏃", yoga: "🧘",
  art: "🎨", writing: "✍️", movies: "🎬", film: "🎬", dogs: "🐶",
  cats: "🐱", nature: "🌿", beach: "🏖️", ocean: "🌊", dance: "💃",
  fashion: "👗", tech: "💻", coding: "💻", science: "🔬", sports: "⚽",
  soccer: "⚽", basketball: "🏀", swimming: "🏊", cycling: "🚴",
  gardening: "🌱", plants: "🪴", baking: "🧁", wine: "🍷", camping: "🏕️",
};

function fallback(interests) {
  const tokens = interests
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const found = [];
  for (const token of tokens) {
    for (const [key, emoji] of Object.entries(FALLBACK_MAP)) {
      if (token.includes(key)) {
        found.push(emoji);
        break;
      }
    }
  }
  const deduped = [...new Set(found)];
  return deduped.length > 0 ? deduped.slice(0, 8) : ["✨", "🌟", "💫"];
}

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

export async function generate(modelId, interests) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You suggest emoji for a social media bio based on a person's interests and hobbies. " +
          "Given a list of interests, reply with ONLY a string of relevant emoji (6-10 of them), " +
          "separated by single spaces, no words, no preamble, no explanation.",
      },
      { role: "user", content: "Interests: hiking, coffee, photography, dogs" },
      { role: "assistant", content: "🥾 ☕ 📷 🐶 🌄 🌲" },
      { role: "user", content: "Interests: gaming, coding, anime, pizza" },
      { role: "assistant", content: "🎮 💻 🍕 🌸 🕹️ ⌨️" },
      { role: "user", content: `Interests: ${interests}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.8, maxTokens: 60 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text.trim();

  let emoji = looksUnusable(text) ? [] : extractEmoji(text);
  if (emoji.length === 0) emoji = fallback(interests);

  return { emoji };
}
