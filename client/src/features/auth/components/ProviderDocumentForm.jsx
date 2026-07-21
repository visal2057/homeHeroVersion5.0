import { useState } from 'react';
import FormInput from '../../../components/common/FormInput.jsx';
import FileUpload from '../../../components/common/FileUpload.jsx';
import TermsModal from './TermsModal.jsx';
import { IconImage, IconShield } from '../../../components/common/icons.jsx';

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
    <div className="register-glass-grid animate-fade-in-up">
      <div className="register-glass-box">
        <div className="register-glass-box-header">
          <span className="register-glass-box-icon"><IconImage size={20} /></span>
          <div>
            <h3>Identity Documents</h3>
            <p>Photos used to confirm it&apos;s really you</p>
          </div>
        </div>

        <FileUpload label="Face Photograph" name="facePhoto" accept="image/jpeg,image/png" error={errors.facePhoto} onFileSelected={(file) => onFileChange('facePhoto', file)} />
        <FileUpload label="NIC Front Image" name="nicFront" accept="image/jpeg,image/png" error={errors.nicFront} onFileSelected={(file) => onFileChange('nicFront', file)} />
        <FileUpload label="NIC Back Image" name="nicBack" accept="image/jpeg,image/png" error={errors.nicBack} onFileSelected={(file) => onFileChange('nicBack', file)} />
      </div>

      <div className="register-glass-box">
        <div className="register-glass-box-header">
          <span className="register-glass-box-icon"><IconShield size={20} /></span>
          <div>
            <h3>Police Clearance</h3>
            <p>Verification report &amp; platform terms</p>
          </div>
        </div>

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

        <div className="form-checkbox" style={{ marginBottom: 'var(--space-sm)' }}>
          <input type="checkbox" id="termsAccepted" checked={form.termsAccepted} onChange={handleTermsCheckbox} />
          <label htmlFor="termsAccepted">
            I have read and agree to the{' '}
            <button type="button" onClick={() => setIsTermsOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-400)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
              Terms and Conditions
            </button>
          </label>
        </div>
        {errors.termsAccepted && <div className="form-error">{errors.termsAccepted}</div>}
      </div>

      <div className="register-submit-row">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary btn-shine" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
