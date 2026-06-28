import { useEffect, useState } from 'react';
import SiteImageManager from '../components/SiteImageManager.jsx';
import { fetchSiteImages, updateSiteImage } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { HERO_IMAGE_URL } from '../../../../constants/serviceCategories.js';
import { LOGIN_SIDE_IMAGE_URL } from '../../../../constants/pageImages.js';

export default function ContentManagementPage() {
  const [images, setImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingType, setSavingType] = useState(null);
  const { showError, showSuccess } = useAlert();

  function loadImages() {
    return fetchSiteImages()
      .then(({ data }) => setImages(data.data.images))
      .catch((error) => showError(extractErrorMessage(error)));
  }

  useEffect(() => {
    loadImages().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(assetType, formData) {
    setSavingType(assetType);
    try {
      await updateSiteImage(formData);
      showSuccess('Image updated. The change is now live for visitors.');
      await loadImages();
      return true;
    } catch (error) {
      showError(extractErrorMessage(error));
      return false;
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

      {!isLoading && (
        <div className="dashboard-grid">
          <SiteImageManager
            title="Home Page Hero Image"
            description="The full-width background photo behind the headline on the public landing page."
            image={images.HOME_HERO_IMAGE}
            fallbackUrl={HERO_IMAGE_URL}
            assetType="HOME_HERO_IMAGE"
            isSaving={savingType === 'HOME_HERO_IMAGE'}
            onSave={(formData) => handleSave('HOME_HERO_IMAGE', formData)}
          />
          <SiteImageManager
            title="Login Page Image"
            description="Displayed on the left side of the login page, behind the glass info tile."
            image={images.LOGIN_SIDE_IMAGE}
            fallbackUrl={LOGIN_SIDE_IMAGE_URL}
            assetType="LOGIN_SIDE_IMAGE"
            isSaving={savingType === 'LOGIN_SIDE_IMAGE'}
            onSave={(formData) => handleSave('LOGIN_SIDE_IMAGE', formData)}
          />
        </div>
      )}
    </div>
  );
}
