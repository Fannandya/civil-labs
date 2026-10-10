"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  Filter,
  Lightbulb,
  Search,
  X
} from "lucide-react";
import { civilGlossaryData } from "../../data/civilGlossary";
import { matchesGlossarySearch } from "@/lib/glossarySearch";

interface GlobalGlossaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntryId?: string | null;
}

type CategoryFilter = "all" | "simbol_rumus" | "struktur_beton" | "rekayasa_gempa" | "geoteknik_pondasi" | "beban_gedung";

const categoryLabels: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "Semua Istilah" },
  { key: "simbol_rumus", label: "Simbol Rumus" },
  { key: "struktur_beton", label: "Struktur Beton" },
  { key: "rekayasa_gempa", label: "Rekayasa Gempa" },
  { key: "geoteknik_pondasi", label: "Geoteknik & Pondasi" },
  { key: "beban_gedung", label: "Pembebanan" }
];

export function GlobalGlossaryModal(props: GlobalGlossaryModalProps) {
  return <GlossaryContent key={`${props.initialEntryId ?? "all"}:${props.open}`} {...props} />;
}

function GlossaryContent({ open, onOpenChange, initialEntryId }: GlobalGlossaryModalProps) {
  const [searchQuery, setSearchQuery] = useState(() => civilGlossaryData.find(item => item.id === initialEntryId)?.term ?? "");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");



  const filteredTerms = useMemo(() => {
    return civilGlossaryData.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = matchesGlossarySearch(item, searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#172638]/45 backdrop-blur-sm" />
        <Dialog.Content
          aria-label="Kamus Glosarium Teknik Sipil"
          className="lms-modal fixed left-1/2 top-1/2 z-[101] flex h-[min(88dvh,860px)] max-h-[calc(100dvh-24px)] w-[min(800px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-[var(--ink)] shadow-xl sm:p-6"
        >
          {/* Header with Back Button */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Kembali ke Model 3D</span>
                <span className="sm:hidden">Kembali</span>
              </button>
              <div className="min-w-0">
                <Dialog.Title className="break-words text-[20px] font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-[22px]">
                  Kamus Glosarium & Simbol Rumus
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                  Ringkasan istilah & panduan konseptual mahasiswa teknik sipil
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Tutup glosarium"
                className="shrink-0 rounded-md p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-4 shrink-0 space-y-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                type="text"
                aria-label="Cari istilah glosarium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari simbol rumus (f'c, phi) atau istilah (SRPMK, drift)..."
                className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] py-2.5 pl-10 pr-16 text-[14px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  Hapus
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="scrollbar flex max-w-full items-center gap-2 overflow-x-auto pb-1 text-[13px]">
              {categoryLabels.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  aria-pressed={selectedCategory === cat.key}
                  className={`whitespace-nowrap rounded-md px-3 py-2 font-medium transition ${
                    selectedCategory === cat.key
                      ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                      : "border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terms Count Badge */}
          <div className="mt-2 shrink-0 text-[12px] leading-relaxed text-[var(--muted)]">
            Menampilkan <span className="font-semibold text-[var(--accent)]">{filteredTerms.length}</span> entri istilah / simbol
          </div>

          {/* Terms List (Scrollable) */}
          <div className="scrollbar mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
            {filteredTerms.length === 0 ? (
              <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-[var(--line)] p-5 text-center text-[14px] leading-[1.65] text-[var(--muted)]">
                <div>
                  <Filter size={24} className="mx-auto mb-2 text-[var(--muted)]" />
                  Tidak ditemukan istilah yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
                </div>
              </div>
            ) : (
              filteredTerms.map((term) => (
                <div
                  key={term.id}
                  className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {term.symbol && (
                        <span className="rounded border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-1 font-mono text-[14px] font-semibold text-[var(--accent)]">
                          {term.symbol}
                        </span>
                      )}
                      <h4 className="text-[16px] font-semibold leading-snug text-[var(--ink)]">
                        {term.term}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {term.unit && (
                        <span className="font-mono text-[12px] text-[var(--muted)]">
                          [{term.unit}]
                        </span>
                      )}
                      {term.standardClause && (
                        <span className="rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[12px] font-medium text-[var(--muted)]">
                          {term.standardClause}
                        </span>
                      )}
                    </div>
                  </div>

                  {term.reading && (
                    <div className="mt-2 text-[13px] italic leading-relaxed text-[var(--muted)]">
                      Cara baca: {term.reading}
                    </div>
                  )}

                  {/* Academic Definition */}
                  <div className="mt-3 text-[14px] leading-[1.65] text-[var(--ink)]">
                    <span className="mb-1 block text-[13px] font-semibold text-[var(--muted)]">
                      Definisi dan penjelasan:
                    </span>
                    {term.academicDefinition}
                  </div>

                  {/* Conceptual Explanation */}
                  <div className="mt-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-3 text-[14px] text-[var(--ink)]">
                    <div className="mb-2 flex items-start gap-2 text-[13px] font-semibold leading-relaxed text-[var(--accent)]">
                      <Lightbulb size={15} className="mt-0.5 shrink-0" />
                      <span>Interpretasi konseptual & studi kasus:</span>
                    </div>
                    <p className="leading-[1.65] text-[var(--ink)]">
                      {term.conceptualExplanation}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Back Button */}
          <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--ink)] transition hover:bg-[var(--surface)]"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Model 3D</span>
            </button>
            <Dialog.Close asChild>
              <button className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90">
                Tutup Kamus
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
