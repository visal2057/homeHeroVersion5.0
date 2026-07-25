import { useState } from 'react';
import FormInput from '../../../../components/common/FormInput.jsx';
import FileUpload from '../../../../components/common/FileUpload.jsx';
import TermsModal from '../../../auth/components/TermsModal.jsx';
import { IconImage, IconShield } from '../../../../components/common/icons.jsx';

// Same fields as the public sign-up flow's step 2 (ProviderDocumentForm.jsx).
// The Terms checkbox copy is adjusted from first-person ("I agree...") to
// reflect that the admin is entering this on the provider's behalf.
export default function AddProviderStepTwoFields({ form, errors, onChange, onFileChange, onBack, onSubmit, isSubmitting }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ ...form, [name]: value });
  }

  function handleTermsCheckbox(event) {
    onChange({ ...form, termsAccepted: event.target.checked });
  }

  return (
    <div>
      <div className="admin-form-section">
        <div className="admin-form-section-header">
          <span className="admin-form-section-icon"><IconImage size={18} /></span>
          <div>
            <h4>Identity Documents</h4>
            <p>Photos used to confirm identity</p>
          </div>
        </div>

        <FileUpload label="Face Photograph" name="facePhoto" accept="image/jpeg,image/png" error={errors.facePhoto} onFileSelected={(file) => onFileChange('facePhoto', file)} />
        <FileUpload label="NIC Front Image" name="nicFront" accept="image/jpeg,image/png" error={errors.nicFront} onFileSelected={(file) => onFileChange('nicFront', file)} />
        <FileUpload label="NIC Back Image" name="nicBack" accept="image/jpeg,image/png" error={errors.nicBack} onFileSelected={(file) => onFileChange('nicBack', file)} />
      </div>

      <div className="admin-form-section">
        <div className="admin-form-section-header">
          <span className="admin-form-section-icon"><IconShield size={18} /></span>
          <div>
            <h4>Police Clearance</h4>
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
          <input type="checkbox" id="adminProviderTermsAccepted" checked={form.termsAccepted} onChange={handleTermsCheckbox} />
          <label htmlFor="adminProviderTermsAccepted">
            I confirm the provider has read and agrees to the{' '}
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              Terms and Conditions
            </button>
          </label>
        </div>
        {errors.termsAccepted && <div className="form-error">{errors.termsAccepted}</div>}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
