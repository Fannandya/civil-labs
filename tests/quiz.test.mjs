import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import ts from 'typescript';
import { analyzeQuizBank, assertQuizQuality } from '../scripts/quiz-quality.mjs';

const require = createRequire(new URL('../src/lib/quiz.ts', import.meta.url));
const sandboxModule = { exports: {} };
const source = ts.transpileModule(readFileSync(new URL('../src/lib/quiz.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
}).outputText;
vm.runInNewContext(source, { require, module: sandboxModule, exports: sandboxModule.exports });
const { quizQuestions, selectQuizQuestions, scoreQuiz } = sandboxModule.exports;

test('length-only guessing has no dominant rank across the bank, topics, or levels', () => {
  assert.doesNotThrow(() => assertQuizQuality(quizQuestions));
});

test('equal-length ties receive random-choice probability rather than a guaranteed win', () => {
  const fixture = [{ topicId: 'X', level: 'C1', correctOptionId: 'B',
    options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: id })) }];
  const report = analyzeQuizBank(fixture)[0];
  assert.deepEqual(report.characters, [.25, .25, .25, .25]);
  assert.deepEqual(report.words, [.25, .25, .25, .25]);
});

test('authoring guard rejects both the original longest cue and a reversed shortest cue', () => {
  for (const short of [false, true]) {
    const fixture = Array.from({ length: 12 }, (_, index) => {
      const correctOptionId = ['A', 'B', 'C', 'D'][index % 4];
      return {
        id: String(index), topicId: 'X', level: 'C1', correctOptionId,
        options: ['A', 'B', 'C', 'D'].map(id => ({
          id,
          text: id === correctOptionId
            ? short ? 'x' : 'correct answer is uniquely the longest option'
            : `different misleading alternative ${id}`
        }))
      };
    });
    assert.throws(() => assertQuizQuality(fixture),
      short ? /shortest by characters/ : /longest by characters/);
  }
});

test('randomized options retain correct IDs and full marks for the actual answer key', () => {
  const original = JSON.stringify(quizQuestions);
  for (const random of [() => 0, () => .3, () => .999999]) {
    const selected = selectQuizQuestions({ topicId: 'all', level: 'all', count: 'all' }, random);
    const answers = Object.fromEntries(selected.map(question => [question.id, question.correctOptionId]));
    const score = scoreQuiz(selected, answers);
    assert.equal(score.correct, 240);
    assert.equal(score.percentage, 100);
    for (const question of selected) {
      const canonical = quizQuestions.find(item => item.id === question.id);
      assert.equal(question.options.find(option => option.id === question.correctOptionId).text,
        canonical.options.find(option => option.id === canonical.correctOptionId).text);
    }
  }
  assert.equal(JSON.stringify(quizQuestions), original);
});

test('balanced topic and level totals cannot hide cues in their selectable intersections', () => {
  const fixture = [];
  for (let topic = 0; topic < 4; topic++) {
    for (let level = 0; level < 4; level++) {
      for (let index = 0; index < 8; index++) {
        const correctOptionId = ['A', 'B', 'C', 'D'][index % 4];
        const rank = (topic + level) % 4;
        const wrongLengths = [8, 6, 4, 2].filter((_, position) => position !== rank);
        fixture.push({
          id: `${topic}-${level}-${index}`, topicId: String(topic), level: String(level), correctOptionId,
          options: ['A', 'B', 'C', 'D'].map(id => ({ id,
            text: id === correctOptionId ? 'x'.repeat([8, 6, 4, 2][rank]) : 'y'.repeat(wrongLengths.shift())
          }))
        });
      }
    }
  }
  const report = analyzeQuizBank(fixture);
  for (const group of report.filter(group => !group.group.includes(':level:'))) {
    assert.deepEqual(group.characters, [.25, .25, .25, .25]);
  }
  assert.throws(() => assertQuizQuality(fixture), /topic:0:level:0: longest by characters wins 100/);
});

test('the audit JSON output is machine readable', () => {
  const output = execFileSync(process.execPath, ['scripts/audit-quiz.mjs', '--json'], {
    cwd: new URL('../', import.meta.url), encoding: 'utf8'
  });
  assert.equal(JSON.parse(output)[0].count, 240);
});

test('short filtered pools still reject obvious length cues', () => {
  const fixture = Array.from({ length: 3 }, (_, index) => ({
    id: String(index), topicId: 'X', level: 'C1', correctOptionId: 'A',
    options: [
      { id: 'A', text: 'The keyed choice is conspicuously the longest answer here' },
      { id: 'B', text: 'Alternative one' },
      { id: 'C', text: 'Alternative two' },
      { id: 'D', text: 'Alternative three' }
    ]
  }));
  assert.throws(() => assertQuizQuality(fixture), /topic:X:level:C1: longest by characters wins 100/);
});

test('wrong and unanswered responses keep the original grading rules', () => {
  const questions = selectQuizQuestions({ topicId: 'BLK', level: 'all', count: 10 }, () => .3);
  const answers = {
    [questions[0].id]: questions[0].correctOptionId,
    [questions[1].id]: questions[1].options.find(option => option.id !== questions[1].correctOptionId).id
  };
  const score = scoreQuiz(questions, answers);
  assert.equal(score.correct, 1);
  assert.equal(score.wrong, 1);
  assert.equal(score.unanswered, 8);
  assert.equal(score.percentage, 10);
});

test('the runtime question bank matches the authoritative Markdown source', () => {
  execFileSync(process.execPath, ['scripts/generate-quiz.mjs', '--check'], {
    cwd: new URL('../', import.meta.url), stdio: 'pipe'
  });
});
