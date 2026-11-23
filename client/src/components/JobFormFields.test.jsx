import { fireEvent, render, screen } from '@testing-library/react';
import JobFormFields from './JobFormFields';

const fields = ['title', 'description', 'skills', 'education', 'experience', 'certifications', 'softSkills'];

function renderFields(overrides = {}) {
  const values = {
    title: 'Fixture Role', description: 'Fixture description.',
    skills: ['react'], education: [], experience: [], certifications: [], softSkills: [],
    ...overrides
  };
  const setters = Object.fromEntries(fields.map((field) => [field, jest.fn()]));
  render(<JobFormFields values={values} setters={setters} />);
  return setters;
}

test('title and description labels are linked to their inputs', () => {
  renderFields();
  expect(screen.getByLabelText('Job Title')).toHaveValue('Fixture Role');
  expect(screen.getByLabelText('Description')).toHaveValue('Fixture description.');
});

test('editing the title and description calls the matching setters', () => {
  const setters = renderFields();
  fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'New Role' } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New description.' } });
  expect(setters.title).toHaveBeenCalledWith('New Role');
  expect(setters.description).toHaveBeenCalledWith('New description.');
});

test('renders one tag input for each requirement category', () => {
  renderFields();
  for (const label of ['skills', 'education', 'experience', 'certifications', 'soft skills']) {
    expect(screen.getByPlaceholderText(`Add ${label} and press Enter`)).toBeInTheDocument();
  }
  expect(screen.getByText('react')).toBeInTheDocument();
});

test('adding a requirement tag updates only that category', () => {
  const setters = renderFields();
  const input = screen.getByPlaceholderText('Add education and press Enter');
  fireEvent.change(input, { target: { value: 'BSc' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(setters.education).toHaveBeenCalledWith(['BSc']);
  expect(setters.skills).not.toHaveBeenCalled();
});
