import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // make sure this is imported

export default function App() {
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [score, setScore] = useState(1);
  const [comment, setComment] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTeacher, setSearchTeacher] = useState(null);
  const searchComments = async () => {
  if (!searchQuery.trim()) return;
  const res = await axios.get(`http://localhost:5050/teacher_comments?q=${searchQuery}`);
  setSearchTeacher(res.data.teacher);
  setSearchResults(res.data.comments);
};

  useEffect(() => {
    fetchTeachers();
  }, []);

  const addTeacher = async () => {
  await axios.post('/add_teacher', { name, grade, subject });
  setName('');
  setGrade('');
  setSubject('');
  fetchTeachers();
};

const rateTeacher = async () => {
  await axios.post('/rate_teacher', { teacher_id: teacherId, score, comment });
  setTeacherId('');
  setScore(1);
  setComment('');
  fetchTeachers();
};

const fetchTeachers = async () => {
  const res = await axios.get(`/teacher_comments?q=${searchQuery}`);

  setTeachers(res.data);
  setFiltered(res.data);
};


  const filterTeachers = () => {
  setFiltered(
    teachers.filter(
      t =>
        (!filterGrade || t.grade === parseInt(filterGrade)) &&
        (!filterSubject || t.subject.toLowerCase().includes(filterSubject.toLowerCase()))
    )
  );
};


  return (
    <div className="container">
      <h1>Rate My Teacher</h1>
      <section>
  <h2>Search Comments by Teacher Name</h2>
  <input
    placeholder="Type a teacher's name (e.g., Arjun)"
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
  />
  <button onClick={searchComments}>Search</button>

  {searchTeacher && (
    <div style={{ marginTop: '1rem' }}>
      <h3>Comments for {searchTeacher}</h3>
      {searchResults.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <ul>
          {searchResults.map((cmt, idx) => (
            <li key={idx}><strong>Anonymous User {idx + 1}:</strong> {cmt}</li>
          ))}
        </ul>
      )}
    </div>
  )}
</section>

      <section>
        <h2>Add Teacher</h2>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Grade" value={grade} onChange={e => setGrade(e.target.value)} />
        <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
        <button onClick={addTeacher}>Add</button>
      </section>

      <section>
        <h2>Rate Teacher</h2>
        <select value={teacherId} onChange={e => setTeacherId(e.target.value)}>
          <option value="">Select Teacher</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input type="number" min="1" max="5" value={score} onChange={e => setScore(e.target.value)} />
        <input placeholder="Comment" value={comment} onChange={e => setComment(e.target.value)} />
        <button onClick={rateTeacher}>Submit Rating</button>
      </section>

      <section>
        <h2>Filter</h2>
        <input placeholder="Grade" value={filterGrade} onChange={e => setFilterGrade(e.target.value)} />
        <input placeholder="Subject" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} />
        <button onClick={filterTeachers}>Apply Filter</button>
      </section>

      <section>
        <h2>Teacher List</h2>
        {filtered.map(t => (
          <div key={t.id} className="teacher">
            <div className="teacher-header">
              <strong>{t.name}</strong>
              <span className={`rating ${t.avg_rating >= 4 ? 'good' : t.avg_rating >= 2.5 ? 'okay' : 'bad'}`}>
                {t.avg_rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="teacher-details">
              Grade {t.grade} — {t.subject}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
