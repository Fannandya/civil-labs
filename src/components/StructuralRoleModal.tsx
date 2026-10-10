"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  HardHat,
  Lightbulb,
  ShieldAlert,
  X,
  Zap
} from "lucide-react";
import { CivilElementData } from "../../data/structuralElements";
import {
  CivilStructuralRoleDeepDive,
  structuralRoleDeepDives
} from "../../data/structuralRoleDetails";

interface StructuralRoleModalProps {
  element: CivilElementData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export function StructuralRoleModal({
  element,
  open,
  onOpenChange,
  onBack
}: StructuralRoleModalProps) {
  const deepDive: CivilStructuralRoleDeepDive =
    structuralRoleDeepDives[element.id] ?? {
      fullTitle: `Fungsi & Peran Struktural: ${element.name}`,
      primaryRoleSummary: element.structuralRole,
      coreFunctions: [element.details.mechanism],
      criticalImportance: element.details.criticalRisk,
      extremeEventResponse:
        "Merespons gaya dinamis eksternal secara bertahap melalui sistem rangka dan menyalurkannya ke tanah.",
      fieldBestPractices: [
        "Patuhi kaidah standar " + element.details.standardReference,
        "Lakukan kontrol mutu material dan pengawasan pelaksanaan konstruksi di lapangan."
      ],
      conceptualAnalogy:
        "Bekerja sebagai bagian terpadu dari sistem kesetimbangan statika dan dinamika bangunan."
    };

  const handleClose = () => {
    onBack();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#172638]/45 backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          aria-label={`Ulasan Mendalam: ${element.name}`}
          className="lms-modal fixed left-1/2 top-1/2 z-[70] flex h-[min(88dvh,860px)] max-h-[calc(100dvh-24px)] w-[min(800px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-[var(--ink)] shadow-xl sm:p-6"
        >
          {/* Header with Back Button */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                >
                  <ArrowLeft size={13} />
                  <span>Kembali ke Ikhtisar</span>
                </button>
                <span className="rounded border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-1 text-[12px] font-medium lowercase text-[var(--accent)]">
                  {element.category.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-[12px] text-[var(--muted)]">
                  Urutan #{String(element.loadPathSequence).padStart(2, "0")}
                </span>
              </div>
              <Dialog.Title className="break-words text-[20px] font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-[22px]">
                {deepDive.fullTitle}
              </Dialog.Title>
              <Dialog.Description asChild>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                  <span className="font-medium text-[var(--accent)]">
                    {element.technicalTerm}
                  </span>
                  <span className="text-[var(--muted)]">·</span>
                  <span className="rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[12px] text-[var(--muted)]">
                    {element.details.standardReference}
                  </span>
                </div>
              </Dialog.Description>
            </div>
            <button
              aria-label="Tutup ulasan"
              onClick={handleClose}
              className="shrink-0 rounded-md p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body - Scrollable Content */}
          <div className="scrollbar mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
            {/* 1. Ringkasan Peran Primer */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--accent-soft)] p-4 sm:p-5">
              <div className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-[var(--accent)]">
                <BookOpen size={16} className="mt-0.5 shrink-0" />
                <span>Ringkasan peran mekanis</span>
              </div>
              <p className="mt-3 text-[14px] leading-[1.65] text-[var(--ink)]">
                {deepDive.primaryRoleSummary}
              </p>
            </div>

            {/* 2. Fungsi Inti & Alur Gaya */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5">
              <div className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-[var(--ink)]">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <span>Fungsi-fungsi utama dalam sistem struktur</span>
              </div>
              <div className="mt-3 space-y-2">
                {deepDive.coreFunctions.map((fn, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[14px] leading-[1.65] text-[var(--ink)]">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border border-[var(--line)] bg-[var(--accent-soft)] text-[12px] font-semibold text-[var(--accent)]">
                      {idx + 1}
                    </span>
                    <p className="leading-[1.65]">{fn}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Mengapa Elemen Ini Krusial & Risiko Bila Diabaikan */}
            <div className="rounded-md border border-[#e5c9cc] bg-[#fdf2f2] p-4 sm:p-5">
              <div className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-[#9f3238]">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <span>Mengapa sangat krusial? (Konsekuensi kegagalan)</span>
              </div>
              <p className="mt-3 text-[14px] leading-[1.65] text-[#9f3238]">
                {deepDive.criticalImportance}
              </p>
            </div>

            {/* 4. Perilaku Saat Beban Ekstrem (Gempa/Badai) */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-[var(--accent)]">
                <Zap size={16} className="mt-0.5 shrink-0" />
                <span>Perilaku dinamis saat beban ekstrem (Gempa / Badai)</span>
              </div>
              <p className="mt-3 text-[14px] leading-[1.65] text-[var(--ink)]">
                {deepDive.extremeEventResponse}
              </p>
            </div>

            {/* 5. Praktik Terbaik Detailing Lapangan SNI */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5">
              <div className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-[var(--ink)]">
                <HardHat size={16} className="mt-0.5 shrink-0 text-[#436c58]" />
                <span>Praktik terbaik detail penulangan & konstruksi lapangan</span>
              </div>
              <ul className="mt-3 space-y-2">
                {deepDive.fieldBestPractices.map((bp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[14px] leading-[1.65] text-[var(--ink)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#436c58]" />
                    <span className="leading-[1.65]">{bp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Interpretasi Konseptual & Analogi Mekanika Struktur */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5">
              <div className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-[var(--accent)]">
                <Lightbulb size={16} className="mt-0.5 shrink-0" />
                <span>Interpretasi konseptual & analogi mekanika struktur</span>
              </div>
              <p className="mt-3 text-[14px] leading-[1.65] text-[var(--ink)]">
                {deepDive.conceptualAnalogy}
              </p>
            </div>
          </div>

          {/* Footer with Back Button & Close */}
          <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--ink)] transition hover:bg-[var(--surface)]"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Ikhtisar</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
            >
              Selesai Membaca
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
