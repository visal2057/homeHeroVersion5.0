import { useState } from 'react';
import BanRecommendationForm from './BanRecommendationForm.jsx';

export default function ComplaintVerdictForm({ complaint, onSubmit, isSubmitting }) {
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [verdictText, setVerdictText] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      investigationNotes,
      verdictText,
      banRecommendations: recommendations.map((rec) => ({
        ...rec,
        endsAt: rec.banType === 'TEMPORARY' && rec.endsAt ? new Date(rec.endsAt).toISOString() : null,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card chart-card">
      <h3>Investigation &amp; Verdict</h3>
      <div className="form-group">
        <label className="form-label">Investigation details</label>
        <textarea className="form-control" value={investigationNotes} onChange={(event) => setInvestigationNotes(event.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Final verdict</label>
        <textarea className="form-control" value={verdictText} onChange={(event) => setVerdictText(event.target.value)} required />
      </div>

      <h4>Ban Recommendation</h4>
      <BanRecommendationForm complaint={complaint} recommendations={recommendations} onChange={setRecommendations} />

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
        Submit Verdict
      </button>
    </form>
  );
}
