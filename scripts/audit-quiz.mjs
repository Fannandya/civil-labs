import { readFile } from 'node:fs/promises';
import { analyzeQuizBank, assertQuizQuality } from './quiz-quality.mjs';

const questions = JSON.parse(await readFile(new URL('../data/quizQuestions.json', import.meta.url), 'utf8'));
const report = analyzeQuizBank(questions);
if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  const percent = fraction => (fraction * 100).toFixed(1) + '%';
  console.table(report.map(item => ({
    group: item.group,
    questions: item.count,
    longest: percent(item.characters[0]),
    shortest: percent(item.characters[3]),
    'longest words': percent(item.words[0]),
    'shortest words': percent(item.words[3]),
    'largest length-rank cue': percent(Math.max(...item.characters, ...item.words))
  })));
}
try {
  assertQuizQuality(questions);
  if (!process.argv.includes('--json')) {
    process.stdout.write('Quiz authoring checks passed. Ties count as an equal random choice; grading is unaffected.\n');
  }
} catch (error) {
  process.stderr.write(error.message + '\n');
  process.exitCode = 1;
}
