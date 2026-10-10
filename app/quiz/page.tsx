import type { Metadata } from "next";
import QuizApp from "@/components/QuizApp";
import "./quiz.css";

export const metadata: Metadata = {
  title: "Kuis Teknik Sipil | Fakultas Teknik Learning Lab",
  description: "Latihan interaktif tentang elemen struktur, pembebanan, rumus, dan istilah teknik sipil, dilengkapi pembahasan jawaban."
};

export default function QuizPage() {
  return <QuizApp />;
}
