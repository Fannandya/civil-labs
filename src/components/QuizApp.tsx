"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, ClipboardList, RotateCcw } from "lucide-react";
import { filterQuestions, quizLevels, quizQuestions, quizTopics, scoreQuiz, selectQuizQuestions, type QuizLevel, type QuizQuestion } from "@/lib/quiz";
import { quizReferenceFor } from "@/lib/quizReference";

const optionLetters = ["A", "B", "C", "D"];

function QuizText({ text }: { text: string }) {
  return <>{text.split(/(`[^`]+`)/g).map((part, index) => part.startsWith("`") && part.endsWith("`")
    ? <code key={index}>{part.slice(1, -1)}</code>
    : <span key={index}>{part}</span>)}</>;
}

export default function QuizApp() {
  const [phase, setPhase] = useState<"setup" | "active" | "result">("setup");
  const [topicId, setTopicId] = useState("all");
  const [level, setLevel] = useState<QuizLevel | "all">("all");
  const [count, setCount] = useState<number | "all">(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const phaseHeading = useRef<HTMLHeadingElement>(null);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const previousPhase = useRef(phase);
  const previousIndex = useRef(currentIndex);
  const available = filterQuestions(topicId, level).length;
  const plannedCount = count === "all" ? available : Math.min(count, available);
  const currentQuestion = questions[currentIndex];
  const score = scoreQuiz(questions, answers);
  const answeredCount = score.total - score.unanswered;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const reference = currentQuestion ? quizReferenceFor(currentQuestion) : undefined;

  useEffect(() => {
    if (previousPhase.current !== phase) {
      (phase === "active" ? questionHeading.current : phaseHeading.current)?.focus();
    } else if (previousIndex.current !== currentIndex) {
      questionHeading.current?.focus();
    }
    previousPhase.current = phase;
    previousIndex.current = currentIndex;
  }, [phase, currentIndex]);

  function startQuiz() {
    const selected = selectQuizQuestions({ topicId, level, count });
    if (selected.length === 0) return;
    setQuestions(selected);
    setAnswers({});
    setCurrentIndex(0);
    setPhase("active");
  }

  function finishQuiz() {
    setCurrentIndex(0);
    setPhase("result");
  }

  function retryQuiz() {
    setAnswers({});
    setCurrentIndex(0);
    setPhase("active");
  }

  function newQuiz() {
    setPhase("setup");
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
  }

  return <div className="quiz-page">
    <header className="lms-header quiz-header">
      <Link href="/" className="quiz-brand" aria-label="Fakultas Teknik Learning Lab, kembali ke laboratorium 3D">
        
        <span><span className="quiz-brand-name">Fakultas Teknik <span>Learning Lab</span></span><span className="quiz-brand-caption">Laboratorium visual teknik sipil</span></span>
      </Link>
      <Link href="/" className="ui-button quiz-back" aria-label="Kembali ke lab 3D"><ArrowLeft size={16} aria-hidden="true" /><span>Kembali ke lab 3D</span></Link>
    </header>

    <main className="quiz-main">
      <div className="quiz-breadcrumb"><ClipboardList size={15} aria-hidden="true" /><span>Latihan teknik sipil</span><ChevronRight size={13} aria-hidden="true" /><span>{phase === "setup" ? "Pengaturan kuis" : phase === "active" ? "Mengerjakan kuis" : "Hasil & pembahasan"}</span></div>

      {phase === "setup" ? <>
        <section className="quiz-intro">
          <p className="quiz-eyebrow">Belajar, lalu uji pemahaman</p>
          <h1 ref={phaseHeading} tabIndex={-1}>Kuis teknik sipil</h1>
          <p>Latih pemahaman elemen struktur, vektor beban, rumus, dan istilah teknik sipil. Pilih materi yang ingin dipelajari; pembahasan tersedia setelah kuis selesai.</p>
        </section>

        <div className="quiz-setup-layout">
          <section className="quiz-card quiz-settings" aria-labelledby="quiz-settings-title">
            <div className="quiz-section-title"><h2 id="quiz-settings-title">Atur latihanmu</h2><span>{quizQuestions.length} soal dalam bank</span></div>
            <form onSubmit={(event) => { event.preventDefault(); startQuiz(); }}>
              <div className="quiz-field">
                <label htmlFor="quiz-topic">Topik materi</label>
                <select id="quiz-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                  <option value="all">Semua topik</option>
                  {quizTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}
                </select>
              </div>
              <div className="quiz-fields-row">
                <div className="quiz-field">
                  <label htmlFor="quiz-level">Jenis pemahaman</label>
                  <select id="quiz-level" value={level} onChange={(event) => setLevel(event.target.value as QuizLevel | "all")}>
                    <option value="all">Semua tingkat</option>
                    {quizLevels.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.label}</option>)}
                  </select>
                </div>
                <div className="quiz-field">
                  <label htmlFor="quiz-count">Jumlah soal</label>
                  <select id="quiz-count" value={count} onChange={(event) => setCount(event.target.value === "all" ? "all" : Number(event.target.value))}>
                    <option value={10}>Hingga 10 soal</option>
                    <option value={20}>Hingga 20 soal</option>
                    <option value="all">Semua soal yang tersedia</option>
                  </select>
                </div>
              </div>
              <p className="quiz-selection-summary">Tingkat soal: C1 mengingat fakta atau istilah; C2 menjelaskan pemahaman konsep; C3 menerapkan konsep atau melakukan analisis sederhana.</p>
              <p className="quiz-selection-summary" role="status">{available > 0 ? <><strong>{plannedCount} soal</strong> akan dipilih secara acak dari {available} soal yang sesuai.</> : "Belum ada soal untuk kombinasi topik dan tingkat ini. Pilih pengaturan lainnya."}</p>
              <button className="ui-button ui-button-primary quiz-start" type="submit" disabled={available === 0}>Mulai kuis<ArrowRight size={16} aria-hidden="true" /></button>
            </form>
          </section>

          <aside className="quiz-card quiz-guide" aria-labelledby="quiz-guide-title">
            <BookOpen size={21} aria-hidden="true" /><h2 id="quiz-guide-title">Cara mengerjakan</h2>
            <ol>
              <li>Pilih satu jawaban untuk setiap soal.</li>
              <li>Gunakan nomor soal untuk berpindah. Jawaban dapat diubah sebelum selesai.</li>
              <li>Selesaikan kuis untuk melihat nilai, jawaban benar, dan pembahasan.</li>
            </ol>
            <p>Tanpa batas waktu. Gunakan latihan ini untuk menemukan materi yang perlu dipelajari kembali.</p>
            <div className="quiz-bank-note"><strong>Catatan bank soal</strong><p>Soal bersumber dari referensi materi proyek dan masih memerlukan tinjauan dosen sebelum digunakan sebagai penilaian resmi.</p></div>
          </aside>
        </div>
      </> : <>
        {phase === "result" ? <section className="quiz-card quiz-results" aria-labelledby="quiz-results-title">
          <div className="quiz-results-top">
            <div><p className="quiz-eyebrow">Latihan selesai</p><h1 id="quiz-results-title" ref={phaseHeading} tabIndex={-1}>Hasil kuis</h1><p>Pelajari pembahasan untuk memahami alasan di balik setiap jawaban.</p></div>
            <div className="quiz-score"><strong>{score.percentage.toLocaleString("id-ID", { maximumFractionDigits: 1 })}<span>%</span></strong><span>Jawaban benar dari seluruh soal</span></div>
          </div>
          <dl className="quiz-score-breakdown">
            <div><dt>Benar</dt><dd>{score.correct}</dd></div><div><dt>Salah</dt><dd>{score.wrong}</dd></div><div><dt>Belum dijawab</dt><dd>{score.unanswered}</dd></div><div><dt>Total soal</dt><dd>{score.total}</dd></div>
          </dl>
          <div className="quiz-result-actions"><button className="ui-button" type="button" onClick={retryQuiz}><RotateCcw size={15} aria-hidden="true" />Ulangi soal ini</button><button className="ui-button ui-button-primary" type="button" onClick={newQuiz}>Pilih latihan baru<ArrowRight size={15} aria-hidden="true" /></button></div>
        </section> : <div className="quiz-active-intro"><h1>Kuis teknik sipil</h1><p>Kamu dapat berpindah soal dan mengubah jawaban sebelum kuis selesai.</p></div>}

        {currentQuestion && <div className="quiz-workspace">
          <section className="quiz-card quiz-question" aria-labelledby="quiz-question-heading">
            <div className="quiz-question-meta"><span>{phase === "result" ? "Pembahasan" : "Soal"} {currentIndex + 1} dari {questions.length}</span><span>{currentQuestion.topic} · {currentQuestion.level}</span></div>
            <h2 id="quiz-question-heading" ref={questionHeading} tabIndex={-1}><QuizText text={currentQuestion.prompt} /></h2>
            <fieldset className="quiz-options" aria-labelledby="quiz-question-heading" disabled={phase === "result"}>
              <legend className="quiz-sr-only">Pilih satu jawaban</legend>
              {currentQuestion.options.map((option, index) => {
                const selected = currentAnswer === option.id;
                const correct = phase === "result" && option.id === currentQuestion.correctOptionId;
                const wrong = phase === "result" && selected && !correct;
                return <label key={option.id} className={`quiz-option${selected ? " is-selected" : ""}${correct ? " is-correct" : ""}${wrong ? " is-wrong" : ""}`}>
                  <input type="radio" name={currentQuestion.id} value={option.id} checked={selected} onChange={() => setAnswers((previous) => ({ ...previous, [currentQuestion.id]: option.id }))} />
                  <span className="quiz-option-letter">{optionLetters[index]}</span>
                  <span className="quiz-option-content"><span><QuizText text={option.text} /></span>{phase === "result" && (selected || correct) && <span className="quiz-option-feedback">{correct ? <><Check size={13} aria-hidden="true" />{selected ? "Jawaban kamu · Benar" : "Jawaban benar"}</> : "Jawaban kamu · Salah"}</span>}</span>
                </label>;
              })}
            </fieldset>

            {phase === "result" && <div className="quiz-explanation">
              <p className="quiz-answer-status">{!currentAnswer ? "Soal ini belum dijawab." : currentAnswer === currentQuestion.correctOptionId ? "Jawaban kamu benar." : "Jawaban kamu belum tepat."}</p>
              <h3>Pembahasan</h3><p><QuizText text={currentQuestion.explanation} /></p>
              <div className="quiz-reference"><h4>Referensi materi</h4>{reference && <p><Link href={reference.href} target="_blank" rel="noopener noreferrer">{reference.label} (buka tab baru)</Link></p>}</div>
            </div>}

            <div className="quiz-question-navigation"><button className="ui-button" type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}><ChevronLeft size={16} aria-hidden="true" />Sebelumnya</button><span>{currentIndex + 1} / {questions.length}</span><button className="ui-button" type="button" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex((index) => index + 1)}>Berikutnya<ChevronRight size={16} aria-hidden="true" /></button></div>
          </section>

          <aside className="quiz-card quiz-navigator" aria-labelledby="quiz-navigator-title">
            <h2 id="quiz-navigator-title">{phase === "result" ? "Tinjau jawaban" : "Progres pengerjaan"}</h2>
            <p className="quiz-progress-caption">{answeredCount} dari {questions.length} soal dijawab</p>
            <progress value={answeredCount} max={questions.length} aria-label={`${answeredCount} dari ${questions.length} soal dijawab`} />
            <nav aria-label="Nomor soal" className="quiz-number-grid">
              {questions.map((question, index) => {
                const answer = answers[question.id];
                const status = phase === "result" ? !answer ? "unanswered" : answer === question.correctOptionId ? "correct" : "wrong" : answer ? "answered" : "unanswered";
                const label = status === "correct" ? "jawaban benar" : status === "wrong" ? "jawaban salah" : status === "answered" ? "sudah dijawab" : "belum dijawab";
                return <button key={question.id} type="button" className={`quiz-number is-${status}`} aria-current={index === currentIndex ? "step" : undefined} aria-label={`Soal ${index + 1}, ${label}`} onClick={() => setCurrentIndex(index)}>{index + 1}</button>;
              })}
            </nav>
            <div className="quiz-number-legend"><span><i className={phase === "result" ? "is-correct" : "is-answered"} />{phase === "result" ? "Benar" : "Dijawab"}</span>{phase === "result" && <span><i className="is-wrong" />Salah</span>}<span><i className="is-unanswered" />Belum dijawab</span></div>
            {phase === "active" && <div className="quiz-finish-section">
              <p aria-live="polite">{score.unanswered > 0 ? <><strong>{score.unanswered} soal belum dijawab.</strong> Jika selesai sekarang, soal tersebut dicatat sebagai belum dijawab.</> : "Semua soal sudah dijawab. Kamu dapat meninjau kembali sebelum selesai."}</p>
              <button className="ui-button ui-button-primary" type="button" onClick={finishQuiz}>Selesaikan kuis<Check size={16} aria-hidden="true" /></button>
            </div>}
          </aside>
        </div>}
      </>}
    </main>
    <footer className="quiz-footer">Fakultas Teknik Learning Lab · Latihan pemahaman teknik sipil</footer>
  </div>;
}
