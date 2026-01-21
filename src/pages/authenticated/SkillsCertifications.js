import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SkillsCertifications = () => {
  const { user, refreshUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [certFiles, setCertFiles] = useState([]);

  useEffect(() => {
    if (user?.role === 'TECHNICIAN') {
      loadSkills();
    }
  }, [user]);

  const loadSkills = async () => {
    try {
      const res = await api.get('/auth/me');
      setSkills(res.data.user.skills || []);
    } catch (err) {
      console.error('Failed to load skills', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setCertFiles(Array.from(e.target.files));
  };

  const submitSkill = async (e) => {
    e.preventDefault();

    if (!skillName.trim() || certFiles.length === 0) {
      alert('Skill name and at least one certification are required');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('skillName', skillName);

    certFiles.forEach((file) => {
      formData.append('certifications', file);
    });

    formData.append(
      'certTitles',
      JSON.stringify(certFiles.map((f) => f.name))
    );

    try {
      await api.post('/skills/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSkillName('');
      setCertFiles([]);
      await refreshUser();
      loadSkills();
      alert('Skill submitted for approval');
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'TECHNICIAN') {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Skills & Certifications</h1>

      <h2>Your Skills</h2>
      {loading ? (
        <div>Loading…</div>
      ) : skills.length === 0 ? (
        <div>No skills submitted yet</div>
      ) : (
        <ul>
          {skills.map((skill, i) => (
            <li key={i}>
              <strong>{skill.name}</strong> — Status: {skill.status}
              <ul>
                {skill.certifications.map((cert, j) => (
                  <li key={j}>
                    <a href={cert.fileUrl} target="_blank" rel="noreferrer">
                      {cert.title}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <h2>Submit New Skill</h2>
      <form onSubmit={submitSkill}>
        <div>
          <label>Skill Name</label>
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Certification Files</label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

export default SkillsCertifications;
