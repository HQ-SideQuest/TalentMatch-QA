Feature: CV scoring

Scenario: A CV matches only one of two required skills
    Given the job requires "JavaScript" and "React"
    And the CV contains "JavaScript"
    When TalentMatch scores the CV
    Then the skills score is 200
    And the total score is 200

Scenario: JavaScript does not satisfy a Java requirement
    Given the job requires only "Java"
    And the CV contains "JavaScript"
    When TalentMatch scores the CV
    Then the skills score is 0
    And the total score is 0