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

  return (
    <div className="container section">
      <h1 className="section-title text-center">Become a Service Provider</h1>
      <p className="section-subtitle text-center">Step {step} of 2</p>

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
  );
}
