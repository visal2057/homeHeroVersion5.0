import { useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient.js';
import { API_ENDPOINTS } from '../api/apiEndpoints.js';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Public pages (Home hero, Login) start out showing the image that is
// hardcoded in code (fallbackUrl) so there is never a blank flash, then
// swap to whatever the System Admin has uploaded via Content Management,
// if anything. If nothing has been uploaded yet, the fallback stays.
export function useSiteImage(assetType, fallbackUrl) {
  const [imageUrl, setImageUrl] = useState(fallbackUrl);

  useEffect(() => {
    let isMounted = true;
    axiosClient
      .get(API_ENDPOINTS.CONTENT.SITE_IMAGES)
      .then(({ data }) => {
        const asset = data?.data?.images?.[assetType];
        if (isMounted && asset?.url) {
          setImageUrl(`${API_ORIGIN}${asset.url}`);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [assetType]);

  return imageUrl;
}
