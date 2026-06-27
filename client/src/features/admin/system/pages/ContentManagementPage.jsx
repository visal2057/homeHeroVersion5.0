import { useEffect, useState } from 'react';
import SiteImageManager from '../components/SiteImageManager.jsx';
import { fetchSiteImages, updateSiteImage } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

export default function ContentManagementPage() {
  const [images, setImages] = useState({});
  const [savingType, setSavingType] = useState(null);
  const { showError, showSuccess } = useAlert();

  function loadImages() {
    fetchSiteImages()
      .then(({ data }) => setImages(data.data.images))
      .catch((error) => showError(extractErrorMessage(error)));
  }

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(assetType, formData) {
    setSavingType(assetType);
    try {
      await updateSiteImage(formData);
      showSuccess('Image updated successfully.');
      loadImages();
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setSavingType(null);
    }
  }

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">Content Management</h1>
          <p className="section-subtitle">Update the images shown on the public Home and Login pages.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <SiteImageManager
          title="Home Page Hero Image"
          description="Displayed at the top of the public landing page."
          image={images.HOME_HERO_IMAGE}
          assetType="HOME_HERO_IMAGE"
          isSaving={savingType === 'HOME_HERO_IMAGE'}
          onSave={(formData) => handleSave('HOME_HERO_IMAGE', formData)}
        />
        <SiteImageManager
          title="Login Page Side Image"
          description="Displayed beside the login form."
          image={images.LOGIN_SIDE_IMAGE}
          assetType="LOGIN_SIDE_IMAGE"
          isSaving={savingType === 'LOGIN_SIDE_IMAGE'}
          onSave={(formData) => handleSave('LOGIN_SIDE_IMAGE', formData)}
        />
      </div>
    </div>
  );
}
