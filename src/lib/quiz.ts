import questionBank from "../../data/quizQuestions.json";

export type QuizLevel = "C1" | "C2" | "C3";
export type QuizOptionId = "A" | "B" | "C" | "D";
export type QuizOption = { id: QuizOptionId; text: string };
export type QuizQuestion = {
  id: string;
  topicId: string;
  topic: string;
  level: QuizLevel;
  prompt: string;
  options: QuizOption[];
  correctOptionId: QuizOptionId;
  explanation: string;
  reference: string;
};

// Generated from docs/plan-soal.md with scripts/generate-quiz.mjs.
export const quizQuestions = questionBank as QuizQuestion[];

export const quizTopics = [
  { id: "BLK", label: "Balok" },
  { id: "KLM", label: "Kolom" },
  { id: "DGS", label: "Dinding Geser" },
  { id: "PLT", label: "Pelat Lantai" },
  { id: "BSM", label: "Dinding Basement" },
  { id: "PND", label: "Pondasi" },
  { id: "GRV", label: "Gravitasi" },
  { id: "ANG", label: "Angin" },
  { id: "GMP", label: "Gempa" },
  { id: "TNH", label: "Tekanan Tanah" },
  { id: "AIR", label: "Tekanan Air / Uplift" },
  { id: "SIM", label: "Simbol & Rumus" },
  { id: "BBN", label: "Beban Gedung" },
  { id: "STR", label: "Struktur Beton" },
  { id: "RGM", label: "Rekayasa Gempa" },
  { id: "GEO", label: "Geoteknik" },
];

export const quizLevels: { id: QuizLevel; label: string }[] = [
  { id: "C1", label: "Ingatan" },
  { id: "C2", label: "Pemahaman" },
  { id: "C3", label: "Aplikasi / Analisis sederhana" },
];

export function filterQuestions(topicId = "all", level: "all" | QuizLevel = "all"): QuizQuestion[] {
  return quizQuestions.filter((question) =>
    (topicId === "all" || question.topicId === topicId) &&
    (level === "all" || question.level === level),
  );
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

export function selectQuizQuestions(
  selection: { topicId: string; level: "all" | QuizLevel; count: number | "all" },
  random: () => number = Math.random,
): QuizQuestion[] {
  if (selection.count !== "all" && (!Number.isInteger(selection.count) || selection.count < 1)) {
    throw new RangeError("Jumlah soal harus berupa bilangan bulat positif.");
  }
  const pool = filterQuestions(selection.topicId, selection.level);
  const count = selection.count === "all" ? pool.length : Math.min(selection.count, pool.length);
  return shuffle(pool, random).slice(0, count).map((question) => ({
    ...question,
    options: shuffle(question.options, random),
  }));
}

export function scoreQuiz(questions: QuizQuestion[], answers: Record<string, string>) {
  let correct = 0;
  let unanswered = 0;
  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) unanswered += 1;
    else if (answer === question.correctOptionId) correct += 1;
  }
  const total = questions.length;
  return {
    correct,
    wrong: total - correct - unanswered,
    unanswered,
    total,
    percentage: total === 0 ? 0 : Math.round(correct / total * 1000) / 10,
  };
}
