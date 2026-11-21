const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreCV } = require('./cvProcessor');

const fullJob = {
  skills: ['javascript', 'react', 'node', 'mongodb'],
  education: ['bsc', 'computer science'],
  experience: ['2 years', 'internship'],
  certifications: ['aws'],
  softSkills: ['teamwork']
};

const allZero = {
  skills: 0, education: 0, experience: 0, certifications: 0, softSkills: 0, total: 0
};

test('TC-W1: no requirements -> every score is 0', () => {
  assert.deepEqual(scoreCV('any cv text', {}), allZero);
});

test('TC-W2: empty keyword lists -> total is 0', () => {
  const emptyJob = { skills: [], education: [], experience: [], certifications: [], softSkills: [] };
  assert.equal(scoreCV('javascript react', emptyJob).total, 0);
});

test('TC-W3: all keywords found -> 1000', () => {
  const cv = 'JavaScript React Node MongoDB BSc Computer Science 2 years Internship AWS Teamwork';
  assert.deepEqual(scoreCV(cv, fullJob), {
    skills: 400, education: 200, experience: 200, certifications: 100, softSkills: 100, total: 1000
  });
});

test('TC-W4: no keyword found -> 0', () => {
  assert.deepEqual(scoreCV('completely unrelated text', fullJob), allZero);
});

test('TC-W5: 1 of 3 skills found -> 133', () => {
  const result = scoreCV('knows react only', { skills: ['javascript', 'react', 'node'] });
  assert.equal(result.skills, 133);
  assert.equal(result.total, 133);
});

test('TC-W6: 2 of 3 skills found -> 267', () => {
  assert.equal(scoreCV('react and node', { skills: ['javascript', 'react', 'node'] }).skills, 267);
});

test('TC-W7: matching ignores upper/lower case', () => {
  assert.equal(scoreCV('REACT DEVELOPER', { skills: ['ReAcT'] }).skills, 400);
});

test('TC-W8: each category is scored separately', () => {
  assert.deepEqual(scoreCV('aws certified', { certifications: ['aws'], skills: ['rust'] }), {
    skills: 0, education: 0, experience: 0, certifications: 100, softSkills: 0, total: 100
  });
});

test('TC-W9: a total of exactly 700 is possible', () => {
  const job = {
    skills: ['node'],
    education: ['bsc'],
    experience: ['10 years'],
    certifications: ['aws'],
    softSkills: ['teamwork']
  };
  assert.equal(scoreCV('node bsc aws', job).total, 700);
});

test('TC-W10: requirements = undefined -> throws TypeError', () => {
  assert.throws(() => scoreCV('some text', undefined), TypeError);
});

test('TC-W11: cvText = null -> throws TypeError', () => {
  assert.throws(() => scoreCV(null, fullJob), TypeError);
});

test('TC-W12: an empty keyword always matches -> 400', () => {
  assert.equal(scoreCV('anything', { skills: [''] }).skills, 400);
});

test('TC-W13: 1 keyword, found -> 400', () => {
  assert.equal(scoreCV('node', { skills: ['node'] }).skills, 400);
});

test('TC-W14: 2 keywords, 1 found -> 200', () => {
  assert.equal(scoreCV('node', { skills: ['node', 'rust'] }).skills, 200);
});

test('TC-W15: 1000 keywords, 100 found -> 40', () => {
  const keywords = Array.from({ length: 1000 }, (_, i) => `kw${i}x`);
  const cv = keywords.filter((_, i) => i % 10 === 0).join(' ');
  assert.equal(scoreCV(cv, { skills: keywords }).skills, 40);
});
