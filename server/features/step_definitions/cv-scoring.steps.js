const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const { scoreCV } = require('../../utils/cvProcessor');

Given('the job requires {string} and {string}', function (firstSkill, secondSkill) {
  this.requirements = { skills: [firstSkill, secondSkill] };
});

Given('the CV contains {string}', function (cvText) {
  this.cvText = cvText;
});

Given('the job requires only {string}', function (skill) {
  this.requirements = { skills: [skill] };
});

When('TalentMatch scores the CV', function () {
  this.result = scoreCV(this.cvText, this.requirements);
});

Then('the skills score is {int}', function (expectedScore) {
  assert.equal(this.result.skills, expectedScore);
});

Then('the total score is {int}', function (expectedScore) {
  assert.equal(this.result.total, expectedScore);
});