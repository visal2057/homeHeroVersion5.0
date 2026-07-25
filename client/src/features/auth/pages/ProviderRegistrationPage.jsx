import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderPersonalForm from '../components/ProviderPersonalForm.jsx';
import ProviderDocumentForm from '../components/ProviderDocumentForm.jsx';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { fetchRegistrationReference, registerProvider } from '../authApi.js';
import {
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
} from '../authValidation.js';
import { ROUTES } from '../../../constants/routes.js';
import { REGISTER_PROVIDER_STEP1_HERO_IMAGE_URL, REGISTER_PROVIDER_STEP2_HERO_IMAGE_URL } from '../../../constants/pageImages.js';
import { IconHardHat } from '../../../components/common/icons.jsx';

const initialPersonalForm = {
  username: '',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  serviceCategoryIds: [],
  homeDistrictId: '',
  serviceDistrictId: '',
  bio: '',
  workHoursDetails: '',
  hourlyChargeEstimate: '',
};

const initialDocumentForm = {
  policeStationName: '',
  policeReportDate: '',
  termsAccepted: false,
};

export default function ProviderRegistrationPage() {
  const [step, setStep] = useState(1);
  const [reference, setReference] = useState({ districts: [], serviceCategories: [] });
  const [personalForm, setPersonalForm] = useState(initialPersonalForm);
  const [documentForm, setDocumentForm] = useState(initialDocumentForm);
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrationReference()
      .then(({ data }) => setReference(data.data))
      .catch((error) => showError(extractErrorMessage(error)));
  }, [showError]);

  function validatePersonal() {
    return {
      username: validateUsername(personalForm.username),
      fullName: validateRequired(personalForm.fullName, 'Full name'),
      email: validateEmail(personalForm.email),
      phone: validatePhone(personalForm.phone),
      password: validatePassword(personalForm.password),
      confirmPassword: validateConfirmPassword(personalForm.password, personalForm.confirmPassword),
      serviceCategoryIds: personalForm.serviceCategoryIds.length > 0 ? null : 'Select at least one service category',
      homeDistrictId: validateRequired(personalForm.homeDistrictId, 'Home district'),
      serviceDistrictId: validateRequired(personalForm.serviceDistrictId, 'Service district'),
      bio: validateRequired(personalForm.bio, 'Bio'),
      workHoursDetails: validateRequired(personalForm.workHoursDetails, 'Work hours and details'),
      hourlyChargeEstimate: validateRequired(personalForm.hourlyChargeEstimate, 'Estimated hourly charge'),
    };
  }

  function handleNext() {
    const validationErrors = validatePersonal();
    const activeErrors = Object.fromEntries(Object.entries(validationErrors).filter(([, value]) => value));
    setErrors(activeErrors);
    if (Object.keys(activeErrors).length > 0) return;
    setStep(2);
  }

  function validateDocuments() {
    return {
      facePhoto: files.facePhoto ? null : 'Face photograph is required',
      nicFront: files.nicFront ? null : 'NIC front image is required',
      nicBack: files.nicBack ? null : 'NIC back image is required',
      policeReport: files.policeReport ? null : 'Police report is required',
      policeStationName: validateRequired(documentForm.policeStationName, 'Police station name'),
      policeReportDate: validateRequired(documentForm.policeReportDate, 'Police report date'),
      termsAccepted: documentForm.termsAccepted ? null : 'You must accept the Terms and Conditions',
    };
  }

  async function handleSubmit() {
    const validationErrors = validateDocuments();
    const activeErrors = Object.fromEntries(Object.entries(validationErrors).filter(([, value]) => value));
    setErrors(activeErrors);
    if (Object.keys(activeErrors).length > 0) return;

    const formData = new FormData();
    Object.entries(personalForm).forEach(([key, value]) => {
      formData.append(key, key === 'serviceCategoryIds' ? value.join(',') : value);
    });
    Object.entries(documentForm).forEach(([key, value]) => formData.append(key, value));
    Object.entries(files).forEach(([key, file]) => formData.append(key, file));

    setIsSubmitting(true);
    try {
      await registerProvider(formData);
      showSuccess('Application submitted successfully.');
      navigate(ROUTES.VERIFICATION_PENDING);
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const heroImage = step === 1 ? REGISTER_PROVIDER_STEP1_HERO_IMAGE_URL : REGISTER_PROVIDER_STEP2_HERO_IMAGE_URL;
  const heroLabel = step === 1
    ? 'A professional gardener tending a lush vegetable garden'
    : 'A pet-care provider walking a dog across a green lawn';
  const subtitle = step === 1
    ? 'Step 1 of 2 — Set up your account and tell us about the services you provide.'
    : 'Step 2 of 2 — Upload your documents so we can verify your application.';

  return (
    <div className="register-page">
      <div
        className="register-page-bg"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label={heroLabel}
      />
      <div className="register-page-overlay" aria-hidden="true" />
      <div className="container register-page-inner">
        <div className="text-center register-page-heading animate-fade-in-up">
          <div className="hh-float-gentle">
            <span className="hh-eyebrow"><IconHardHat size={16} /> Service Provider Sign Up</span>
            <h1 className="register-page-title">Become a Service Provider</h1>
            <p className="register-page-subtitle">{subtitle}</p>
          </div>
        </div>

        {step === 1 ? (
          <ProviderPersonalForm
            form={personalForm}
            errors={errors}
            districts={reference.districts}
            categories={reference.serviceCategories}
            onChange={setPersonalForm}
            onCategoriesChange={(ids) => setPersonalForm((prev) => ({ ...prev, serviceCategoryIds: ids }))}
            onNext={handleNext}
          />
        ) : (
          <ProviderDocumentForm
            form={documentForm}
            errors={errors}
            onChange={setDocumentForm}
            onFileChange={(field, file) => setFiles((prev) => ({ ...prev, [field]: file }))}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
