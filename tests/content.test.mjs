import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { civilGlossaryData } from '../data/civilGlossary.ts';
import { structuralElements } from '../data/structuralElements.ts';
import { matchesGlossarySearch, normalizeGlossarySearch } from '../src/lib/glossarySearch.ts';
import { quizReferenceFor } from '../src/lib/quizReference.ts';

const bank = JSON.parse(await readFile(new URL('../data/quizQuestions.json', import.meta.url), 'utf8'));

test('glossary search accepts readings, aliases, dashes, primes and subscripts', () => {
  for (const [query, id] of [
    ['phi', 'sym-phi'], ['fi', 'sym-phi'], ["f′c", 'sym-fc'],
    ["f’c", 'sym-fc'], ['mononobe-okabe', 'term-mononobe-okabe'],
    ['p0', 'term-at-rest-pressure'], ['SD₁', 'term-sd1'],
    ['tributary area', 'term-tributary-area'], ['load path', 'term-load-path'],
  ]) {
    assert.ok(matchesGlossarySearch(civilGlossaryData.find(term => term.id === id), query), `${query}: ${id}`);
  }
  assert.equal(normalizeGlossarySearch(' P–Δ '), 'p-δ');
  assert.ok(civilGlossaryData.every(term => matchesGlossarySearch(term, '')));
});

test('strength reduction and soil friction have distinct symbols and specific aliases', () => {
  const reduction = civilGlossaryData.find(term => term.id === 'sym-phi');
  const friction = civilGlossaryData.find(term => term.id === 'sym-friction-angle');
  assert.equal(reduction.symbol, 'φ');
  assert.equal(friction.symbol, 'ϕ');
  assert.notEqual(normalizeGlossarySearch('φ'), normalizeGlossarySearch('ϕ'));
  assert.ok(matchesGlossarySearch(reduction, 'phi kekuatan'));
  assert.equal(matchesGlossarySearch(friction, 'phi kekuatan'), false);
  assert.ok(matchesGlossarySearch(friction, 'phi tanah'));
  assert.equal(matchesGlossarySearch(reduction, 'phi tanah'), false);
});

test('all added terms have units, explanatory boundaries and valid related elements', () => {
  const elementIds = new Set(structuralElements.map(element => element.id));
  const glossaryIds = civilGlossaryData.map(term => term.id);
  assert.equal(new Set(glossaryIds).size, glossaryIds.length);
  for (const id of ['term-sd1', 'term-s1', 'term-tl', 'term-ie', 'term-cd', 'term-tributary-area', 'term-load-path', 'sym-friction-angle']) {
    const term = civilGlossaryData.find(term => term.id === id);
    assert.ok(term.unit);
    assert.ok(term.academicDefinition.length > 40);
    assert.ok(term.conceptualExplanation.length > 40);
    assert.ok(term.relatedElementIds.every(elementId => elementIds.has(elementId)));
  }
});

test('all 240 quiz references link to existing relevant viewer material', () => {
  const elementIds = new Set(structuralElements.map(element => element.id));
  const glossaryIds = new Set(civilGlossaryData.map(term => term.id));
  for (const question of bank) {
    const reference = quizReferenceFor(question);
    assert.ok(reference.label.trim().length > 0, question.id);
    const query = new URL(reference.href, 'https://example.test').searchParams;
    const valid = query.has('element') ? elementIds.has(query.get('element')) : glossaryIds.has(query.get('glossary'));
    assert.ok(valid, `${question.id}: ${reference.href}`);
    assert.ok(question.reference, `Preserve authoring reference: ${question.id}`);
  }
});

test('quiz explanations contain reasons rather than author notes and typo corrections', () => {
  assert.equal(bank.length, 240);
  for (const question of bank) {
    assert.ok(question.explanation.length >= 40, question.id);
    assert.doesNotMatch(question.explanation, /^(Sesuai (glossary|worked example|extremeEvent|criticalRisk|evaluationParameters)|Koreksi audit\.|Terkait (angin|balok|pondasi)\.|SF nominal\.)/i, question.id);
    assert.doesNotMatch(question.explanation, /kolom-balon/, question.id);
  }
});
