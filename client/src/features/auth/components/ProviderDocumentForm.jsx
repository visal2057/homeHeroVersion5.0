import { useState } from 'react';
import FormInput from '../../../components/common/FormInput.jsx';
import FileUpload from '../../../components/common/FileUpload.jsx';
import TermsModal from './TermsModal.jsx';

export default function ProviderDocumentForm({ form, errors, onChange, onFileChange, onBack, onSubmit, isSubmitting }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ ...form, [name]: value });
  }

  function handleTermsCheckbox(event) {
    onChange({ ...form, termsAccepted: event.target.checked });
  }

  return (
    <div className="card" style={{ padding: 'var(--space-xl)', maxWidth: 640, margin: '0 auto' }}>
      <h3>Step 2: Verification Documents</h3>

      <FileUpload label="Face Photograph" name="facePhoto" accept="image/jpeg,image/png" error={errors.facePhoto} onFileSelected={(file) => onFileChange('facePhoto', file)} />
      <FileUpload label="NIC Front Image" name="nicFront" accept="image/jpeg,image/png" error={errors.nicFront} onFileSelected={(file) => onFileChange('nicFront', file)} />
      <FileUpload label="NIC Back Image" name="nicBack" accept="image/jpeg,image/png" error={errors.nicBack} onFileSelected={(file) => onFileChange('nicBack', file)} />
      <FileUpload
        label="Police Report"
        name="policeReport"
        accept="image/jpeg,image/png,application/pdf"
        hint="JPG, PNG or PDF"
        error={errors.policeReport}
        onFileSelected={(file) => onFileChange('policeReport', file)}
      />

      <FormInput label="Police Station Name" name="policeStationName" value={form.policeStationName} onChange={handleChange} error={errors.policeStationName} />
      <FormInput label="Police Report Date" name="policeReportDate" type="date" value={form.policeReportDate} onChange={handleChange} error={errors.policeReportDate} />

      <div className="form-checkbox" style={{ marginBottom: 'var(--space-lg)' }}>
        <input type="checkbox" id="termsAccepted" checked={form.termsAccepted} onChange={handleTermsCheckbox} />
        <label htmlFor="termsAccepted">
          I have read and agree to the{' '}
          <button type="button" onClick={() => setIsTermsOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-700)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
            Terms and Conditions
          </button>
        </label>
      </div>
      {errors.termsAccepted && <div className="form-error" style={{ marginTop: '-0.7rem', marginBottom: 'var(--space-md)' }}>{errors.termsAccepted}</div>}

      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary btn-block" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
