import { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal.jsx';
import AddProviderStepOneFields from './AddProviderStepOneFields.jsx';
import AddProviderStepTwoFields from './AddProviderStepTwoFields.jsx';
import { fetchRegistrationReference, registerProvider } from '../../../auth/authApi.js';
import {
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
} from '../../../auth/authValidation.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

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

// Same two-step state machine, validation and registerProvider() submission
// as the public sign-up flow (ProviderRegistrationPage.jsx), just shown as
// two sequential modal steps instead of two full pages, and reporting back
// to the admin instead of navigating to the verification-pending page.
export default function AddProviderModal({ isOpen, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [reference, setReference] = useState({ districts: [], serviceCategories: [] });
  const [personalForm, setPersonalForm] = useState(initialPersonalForm);
  const [documentForm, setDocumentForm] = useState(initialDocumentForm);
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    if (!isOpen) return;
    fetchRegistrationReference()
      .then(({ data }) => setReference(data.data))
      .catch((error) => showError(extractErrorMessage(error)));
  }, [isOpen, showError]);

  function resetAll() {
    setStep(1);
    setPersonalForm(initialPersonalForm);
    setDocumentForm(initialDocumentForm);
    setFiles({});
    setErrors({});
  }

  function handleClose() {
    resetAll();
    onClose();
  }

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
      termsAccepted: documentForm.termsAccepted ? null : 'You must confirm the Terms and Conditions',
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
      showSuccess(
        'Successfully created a new Provider account. Please wait until the Verification Admin approves the application before the account can be used.',
      );
      resetAll();
      onCreated?.();
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Add Service Provider — Step 1 of 2' : 'Add Service Provider — Step 2 of 2'}
      maxWidth={680}
    >
      {step === 1 ? (
        <AddProviderStepOneFields
          form={personalForm}
          errors={errors}
          districts={reference.districts}
          categories={reference.serviceCategories}
          onChange={setPersonalForm}
          onCategoriesChange={(ids) => setPersonalForm((prev) => ({ ...prev, serviceCategoryIds: ids }))}
          onNext={handleNext}
          onCancel={handleClose}
        />
      ) : (
        <AddProviderStepTwoFields
          form={documentForm}
          errors={errors}
          onChange={setDocumentForm}
          onFileChange={(field, file) => setFiles((prev) => ({ ...prev, [field]: file }))}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
}
