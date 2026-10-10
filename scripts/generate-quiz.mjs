// Generate the quiz bank from its authoritative source: docs/plan-soal.md.
// Run with: node scripts/generate-quiz.mjs
import { readFile, writeFile } from "node:fs/promises";
import { assertQuizQuality } from "./quiz-quality.mjs";

const sourceUrl = new URL("../docs/plan-soal.md", import.meta.url);
const outputUrl = new URL("../data/quizQuestions.json", import.meta.url);
const topics = {
  BLK: ["Balok", 12],
  KLM: ["Kolom", 12],
  DGS: ["Dinding Geser", 12],
  PLT: ["Pelat Lantai", 12],
  BSM: ["Dinding Basement", 12],
  PND: ["Pondasi", 12],
  GRV: ["Gravitasi", 12],
  ANG: ["Angin", 12],
  GMP: ["Gempa", 12],
  TNH: ["Tekanan Tanah", 12],
  AIR: ["Tekanan Air / Uplift", 12],
  SIM: ["Simbol & Rumus", 40],
  BBN: ["Beban Gedung", 8],
  STR: ["Struktur Beton", 21],
  RGM: ["Rekayasa Gempa", 15],
  GEO: ["Geoteknik", 24],
};

const source = await readFile(sourceUrl, "utf8");
const headings = [...source.matchAll(/^### (Q-([A-Z]+)-\d+) \[(C[123]) \| ([^\]]+)\]\s*$/gm)];
const questionHeadingCount = (source.match(/^### Q-/gm) ?? []).length;
if (headings.length !== 240 || questionHeadingCount !== headings.length) {
  throw new Error(`Expected 240 question headings; found ${headings.length} valid of ${questionHeadingCount}.`);
}

const questions = headings.map((heading, index) => {
  const [, id, topicId, level] = heading;
  const topic = topics[topicId]?.[0];
  if (!topic) throw new Error(`Unknown topic for ${id}: ${topicId}`);
  const start = heading.index + heading[0].length;
  const end = headings[index + 1]?.index ?? source.length;
  const block = source.slice(start, end);
  const field = (label) => {
    const matches = [...block.matchAll(new RegExp(`^\\*\\*${label}:\\*\\*[ \\t]*(.+)$`, "gm"))];
    if (matches.length !== 1) throw new Error(`${id}: expected one ${label} field.`);
    return matches[0][1].trim();
  };
  const options = [...block.matchAll(/^- ([A-D])\. (.+)$/gm)].map((match) => ({
    id: match[1],
    text: match[2].trim(),
  }));
  if (options.length !== 4 || options.map((option) => option.id).join("") !== "ABCD") {
    throw new Error(`${id}: expected four options A–D in source order.`);
  }
  const correctOptionId = field("Kunci");
  if (!options.some((option) => option.id === correctOptionId)) {
    throw new Error(`${id}: answer ${correctOptionId} is not one of its options.`);
  }
  return {
    id,
    topicId,
    topic,
    level,
    prompt: field("Pertanyaan"),
    options,
    correctOptionId,
    explanation: field("Pembahasan"),
    reference: field("Referensi"),
  };
});

if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error("Question IDs must be unique.");
}
for (const [topicId, [, count]] of Object.entries(topics)) {
  const actualIds = questions.filter((question) => question.topicId === topicId).map((question) => question.id);
  const expectedIds = Array.from({ length: count }, (_, index) => `Q-${topicId}-${String(index + 1).padStart(2, "0")}`);
  if (actualIds.join(",") !== expectedIds.join(",")) {
    throw new Error(`${topicId}: expected a complete sequence of ${count} questions.`);
  }
}

assertQuizQuality(questions);
const generated = `${JSON.stringify(questions, null, 2)}\n`;
if (process.argv.includes("--check")) {
  const existing = await readFile(outputUrl, "utf8");
  if (existing !== generated) {
    throw new Error("Question bank is stale. Run npm run quiz:generate.");
  }
  process.stdout.write(`Validated ${questions.length} questions against docs/plan-soal.md.\n`);
} else {
  await writeFile(outputUrl, generated);
  process.stdout.write(`Generated ${questions.length} questions across ${Object.keys(topics).length} topics from docs/plan-soal.md.\n`);
}
