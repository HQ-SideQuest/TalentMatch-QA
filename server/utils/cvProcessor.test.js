const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreCV, extractText } = require('./cvProcessor');
const path = require('node:path');

test('gives 200 points when one of two required skills matches', () => {
  const result = scoreCV('JavaScript', {
    skills: ['JavaScript', 'React']
  });

  assert.equal(result.skills, 200);
  assert.equal(result.total, 200);
});

test('gives zero points when none of the required skills match', () => {
  const result = scoreCV('Python', {
    skills: ['JavaScript', 'React']
  });

  assert.equal(result.skills, 0);
  assert.equal(result.total, 0);
});

test('gives 400 points when both required skills match', () => {
  const result = scoreCV('JavaScript and React', {
    skills: ['JavaScript', 'React']
  });

  assert.equal(result.skills, 400);
  assert.equal(result.total, 400);
});

test('does not award Java points when the CV lists only JavaScript', () => {
  const result = scoreCV('JavaScript', {
    skills: ['Java']
  });

  assert.equal(result.skills, 0);
});

test('extractText rejects an unsupported CV file type', async () => {
  await assert.rejects(
    () => extractText('sample-cv.txt'),
    /Unsupported file type/
  );
});

test('extractText reads text from a Word CV', async () => {
  const filePath = path.join(__dirname, 'fixtures', 'sample-cv.docx');

  const actual = await extractText(filePath);

  assert.equal(actual.trim(), 'JavaScript and React');
});