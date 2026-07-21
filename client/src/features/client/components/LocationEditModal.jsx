import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import FormInput from '../../../components/common/FormInput.jsx';
import MapPicker from '../../../components/common/MapPicker.jsx';
import { clientApi } from '../clientApi.js';

export default function LocationEditModal({ isOpen, onClose, label, locationType, initialLocation, onSaved }) {
  const [addressText, setAddressText] = useState('');
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset to this location's own current values every time the modal opens,
  // so state from a previous open (or the other card) never leaks in.
  useEffect(() => {
    if (!isOpen) return;
    setAddressText(initialLocation?.addressText ?? '');
    setPosition(
      initialLocation?.latitude != null
        ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude }
        : null,
    );
    setError('');
  }, [isOpen, initialLocation]);

  async function handleSave() {
    if (!addressText.trim()) {
      setError('Please enter an address.');
      return;
    }
    if (!position) {
      setError('Please select your location on the map.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await clientApi.updateLocation({
        locationType,
        addressText: addressText.trim(),
        latitude: position.latitude,
        longitude: position.longitude,
      });
      onSaved(res.data?.data ?? res.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to save location.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Set ${label}`}>
      <FormInput
        label="Address"
        name="addressText"
        placeholder="House number, street, city"
        value={addressText}
        onChange={(e) => setAddressText(e.target.value)}
      />
      <div className="form-group">
        <label className="form-label">Pin Your Location</label>
        <MapPicker
          latitude={position?.latitude}
          longitude={position?.longitude}
          onChange={setPosition}
          draggable
          height={280}
        />
      </div>
      {error && <div className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Location'}
        </button>
      </div>
    </Modal>
  );
}
