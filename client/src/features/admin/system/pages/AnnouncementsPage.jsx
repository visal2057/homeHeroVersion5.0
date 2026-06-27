import { useEffect, useState } from 'react';
import AnnouncementForm from '../components/AnnouncementForm.jsx';
import AnnouncementsTable from '../components/AnnouncementsTable.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, archiveAnnouncement } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

const TABS = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useAlert();

  function load() {
    setIsLoading(true);
    fetchAnnouncements(statusFilter || undefined)
      .then(({ data }) => setAnnouncements(data.data.announcements))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function openCreate() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  async function handleSubmit(payload) {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateAnnouncement(editingItem.announcementId, payload);
        showSuccess('Announcement updated.');
      } else {
        await createAnnouncement(payload);
        showSuccess('Announcement saved.');
      }
      setIsFormOpen(false);
      load();
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(item) {
    try {
      await archiveAnnouncement(item.announcementId);
      showSuccess('Announcement archived.');
      load();
    } catch (error) {
      showError(extractErrorMessage(error));
    }
  }

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">Announcements</h1>
          <p className="section-subtitle">Draft, schedule, publish and archive platform-wide announcements.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + New Announcement
        </button>
      </div>

      <div className="announcement-status-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`announcement-status-tab${statusFilter === tab.value ? ' active' : ''}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <AnnouncementsTable announcements={announcements} onEdit={openEdit} onArchive={handleArchive} />
      )}

      <AnnouncementForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialValue={editingItem}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
