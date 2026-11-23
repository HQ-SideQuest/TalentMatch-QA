const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreCV, extractText } = require('./cvProcessor');
const path = require('node:path');

test('gives 200 points when one of two required skills matches', () => {
  // One of two required skills matches, so the CV earns half of the 400 skill points.
  // Skills are the only requirement here, so the total is also 200.
  const result = scoreCV('JavaScript', {
    skills: ['JavaScript', 'React']
  });

  assert.equal(result.skills, 200);
  assert.equal(result.total, 200);
});

test('gives zero points when none of the required skills match', () => {
  // Python matches neither required skill, so both the skill score and total are 0.
  const result = scoreCV('Python', {
    skills: ['JavaScript', 'React']
  });

  assert.equal(result.skills, 0);
  assert.equal(result.total, 0);
});

test('gives 400 points when both required skills match', () => {
  // Both required skills match, so the full 400 skill points also make up the total.
  const result = scoreCV('JavaScript and React', {
    skills: ['JavaScript', 'React']
  });

  assert.equal(result.skills, 400);
  assert.equal(result.total, 400);
});

test('does not award Java points when the CV lists only JavaScript', () => {
  // JavaScript is a different skill from Java, so it earns 0 points for Java.
  const result = scoreCV('JavaScript', {
    skills: ['Java']
  });

  assert.equal(result.skills, 0);
});

test('extractText rejects an unsupported CV file type', async () => {
  // A .txt file is unsupported, so extraction should fail with the expected error.
  await assert.rejects(
    () => extractText('sample-cv.txt'),
    /Unsupported file type/
  );
});

test('extractText reads text from a Word CV', async () => {
  // A sample .docx with known text tests the Word reader and gives us text to compare.
  const filePath = path.join(__dirname, 'fixtures', 'sample-cv.docx');

  const actual = await extractText(filePath);

  assert.equal(actual.trim(), 'JavaScript and React');
});