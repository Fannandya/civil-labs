/** Authoring checks: these statistics never influence quiz grading. */
export function visibleOptionText(text) {
  return text.replace(/`([^`]+)`/g, '$1').replace(/\s+/gu, ' ').trim();
}

function rankSuccess(question, measure) {
  const values = question.options.map(option => measure(visibleOptionText(option.text)));
  const correctIndex = question.options.findIndex(option => option.id === question.correctOptionId);
  const value = values[correctIndex];
  const above = values.filter(length => length > value).length;
  const tied = values.filter(length => length === value).length;
  return [0, 1, 2, 3].map(rank => rank >= above && rank < above + tied ? 1 / tied : 0);
}

export function analyzeQuizBank(questions) {
  const groups = new Map([['all', questions]]);
  for (const question of questions) {
    for (const key of [`topic:${question.topicId}`, `level:${question.level}`, `topic:${question.topicId}:level:${question.level}`]) {
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(question);
    }
  }
  return [...groups].map(([group, items]) => {
    const characters = [0, 0, 0, 0];
    const words = [0, 0, 0, 0];
    const keys = { A: 0, B: 0, C: 0, D: 0 };
    for (const question of items) {
      const charRanks = rankSuccess(question, text => [...text].length);
      const wordRanks = rankSuccess(question, text => text.split(/\s+/u).length);
      for (let rank = 0; rank < 4; rank++) {
        characters[rank] += charRanks[rank];
        words[rank] += wordRanks[rank];
      }
      keys[question.correctOptionId]++;
    }
    return {
      group,
      count: items.length,
      characters: characters.map(success => success / items.length),
      words: words.map(success => success / items.length),
      keys
    };
  });
}

export function assertQuizQuality(questions) {
  if (!Array.isArray(questions) || questions.length === 0) throw new Error("Quiz bank must contain questions.");
  if (new Set(questions.map(question => question.id)).size !== questions.length) throw new Error("Question IDs must be unique.");
  for (const question of questions) {
    if (question.options.length !== 4 ||
      question.options.map(option => option.id).sort().join("") !== "ABCD" ||
      !question.options.some(option => option.id === question.correctOptionId)) {
      throw new Error(`${question.id}: four distinct options and a valid key are required.`);
    }
    const texts = question.options.map(option => visibleOptionText(option.text));
    if (texts.some(text => !text) || new Set(texts.map(text => text.toLocaleLowerCase('id-ID'))).size !== 4) {
      throw new Error(`${question.id}: option text must be nonempty and distinct.`);
    }
  }
  const report = analyzeQuizBank(questions);
  const problems = [];
  const rankNames = ['longest', 'second-longest', 'second-shortest', 'shortest'];
  for (const group of report) {
    const topicGroup = group.group.startsWith('topic:');
    // Short selectable pools still need a check for obvious length cues.
    if (group.count < (topicGroup ? 3 : 8)) continue;
    const limit = topicGroup ? .5 : .4;
    for (const metric of ['characters', 'words']) {
      group[metric].forEach((success, rank) => {
        if (success > limit + 1e-9) {
          problems.push(`${group.group}: ${rankNames[rank]} by ${metric} wins ${(success * 100).toFixed(1)}% (limit ${limit * 100}%).`);
        }
      });
    }
    // Source-key frequencies need a larger pool; visible positions are shuffled.
    if (group.count < 8) continue;
    for (const [key, count] of Object.entries(group.keys)) {
      if (count / group.count > limit + 1e-9) {
        problems.push(`${group.group}: key ${key} appears in ${(count / group.count * 100).toFixed(1)}% of source questions.`);
      }
    }
  }
  if (problems.length) throw new Error(`Quiz authoring cues detected:\n${problems.join('\n')}`);
  return report;
}
