const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { cvPathKey, uploadsDirectory } = require('./cvStorage');

test('cvPathKey gives the same key for two paths to the same CV', () => {
  // The relative and absolute paths point to the same file, so they share one key.
  const relativePath = 'uploads/sample-cv.pdf';
  const absolutePath = path.join(uploadsDirectory, 'sample-cv.pdf');

  assert.equal(cvPathKey(relativePath), cvPathKey(absolutePath));
});

test('cvPathKey gives different keys for different CVs', () => {
  // These paths point to different files, so each needs its own key.
  assert.notEqual(
    cvPathKey('uploads/first-cv.pdf'),
    cvPathKey('uploads/second-cv.pdf')
  );
});