import TagInput from './TagInput';

const fieldLabel = 'text-sm font-medium text-[#14181F] block mb-1';
const fieldInput = 'w-full border border-[#E5E8EE] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#2952E3]';

const requirementFields = [
  ['skills', 'Skills'],
  ['education', 'Education'],
  ['experience', 'Experience'],
  ['certifications', 'Certifications'],
  ['softSkills', 'Soft Skills'],
];

// Shared job fields for the Create Job and Edit Job forms.
// `values` holds the current field values; `setters` holds the matching state setters.
export default function JobFormFields({ values, setters }) {
  return (
    <>
      <div>
        <label htmlFor="job-title" className={fieldLabel}>Job Title</label>
        <input
          id="job-title"
          type="text" required value={values.title}
          onChange={(e) => setters.title(e.target.value)}
          className={fieldInput}
        />
      </div>

      <div>
        <label htmlFor="job-description" className={fieldLabel}>Description</label>
        <textarea
          id="job-description"
          required value={values.description} rows={3}
          onChange={(e) => setters.description(e.target.value)}
          className={fieldInput}
        />
      </div>

      {requirementFields.map(([field, label]) => (
        <TagInput key={field} label={label} tags={values[field]} setTags={setters[field]} />
      ))}
    </>
  );
}
