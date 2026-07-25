import { useEffect, useRef, useState } from 'react';
import AddClientModal from './AddClientModal.jsx';
import AddProviderModal from './AddProviderModal.jsx';
import { ClientsIcon, ProvidersIcon } from './DashboardIcons.jsx';
import { IconUserPlus } from '../../../../components/common/icons.jsx';

export default function AddUserMenu({ onCreated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // 'CLIENT' | 'PROVIDER' | null
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  function openForm(kind) {
    setActiveForm(kind);
    setIsMenuOpen(false);
  }

  function handleCreated() {
    setActiveForm(null);
    onCreated?.();
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-primary admin-round-btn"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label="Add user"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
      >
        <IconUserPlus size={22} />
      </button>

      {isMenuOpen && (
        <div className="admin-add-user-dropdown animate-fade-in-up">
          <button type="button" className="admin-add-user-option" onClick={() => openForm('CLIENT')}>
            <span className="admin-add-user-option-icon"><ClientsIcon /></span>
            Client
          </button>
          <button type="button" className="admin-add-user-option" onClick={() => openForm('PROVIDER')}>
            <span className="admin-add-user-option-icon"><ProvidersIcon /></span>
            Provider
          </button>
        </div>
      )}

      <AddClientModal isOpen={activeForm === 'CLIENT'} onClose={() => setActiveForm(null)} onCreated={handleCreated} />
      <AddProviderModal isOpen={activeForm === 'PROVIDER'} onClose={() => setActiveForm(null)} onCreated={handleCreated} />
    </div>
  );
}
