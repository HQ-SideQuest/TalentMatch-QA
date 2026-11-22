import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getJob, updateJob } from '../services/api';
import Navbar from '../components/Navbar';
import JobFormFields from '../components/JobFormFields';
import BackLink from '../components/BackLink';

export default function EditJob() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJob(id)
      .then((res) => {
        const job = res.data;
        setTitle(job.title);
        setDescription(job.description);
        setSkills(job.requirements?.skills || []);
        setEducation(job.requirements?.education || []);
        setExperience(job.requirements?.experience || []);
        setCertifications(job.requirements?.certifications || []);
        setSoftSkills(job.requirements?.softSkills || []);
      })
      .catch((err) => setError('Failed to load job'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length === 0) {
      setError('Please add at least one skill');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setError('');

    try {
      await updateJob(id, {
        title,
        description,
        requirements: { skills, education, experience, certifications, softSkills },
      });
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="bg-white border border-[#E5E8EE] rounded-xl p-8 max-w-md text-center">
            <h2 className="text-xl font-bold text-[#14181F] mb-2">Job Updated!</h2>
            <p className="text-[#5B6472] mb-6">Your changes have been saved.</p>
            <a href="/manage-jobs" className="inline-block bg-[#2952E3] text-white text-sm font-medium px-4 py-2 rounded-lg">
              Back to Manage Jobs
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />
      <div className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <BackLink to="/manage-jobs" label="Back to Manage Jobs" />

          <div className="bg-white border border-[#E5E8EE] rounded-xl p-8 mt-4">
            <h1 className="text-2xl font-bold text-[#14181F] mb-6">Edit Job</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <JobFormFields
                values={{ title, description, skills, education, experience, certifications, softSkills }}
                setters={{
                  title: setTitle, description: setDescription, skills: setSkills, education: setEducation,
                  experience: setExperience, certifications: setCertifications, softSkills: setSoftSkills
                }}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit" disabled={status === 'submitting'}
                className="w-full bg-[#2952E3] text-white font-medium py-2.5 rounded-lg disabled:opacity-50 hover:bg-[#1F3FB8] transition-colors"
              >
                {status === 'submitting' ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}