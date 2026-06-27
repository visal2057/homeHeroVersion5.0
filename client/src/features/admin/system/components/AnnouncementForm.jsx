import { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal.jsx';

const EMPTY_FORM = { title: '', messageBody: '', audience: 'ALL_USERS', publicationMode: 'DRAFT', scheduledFor: '' };

export default function AnnouncementForm({ isOpen, onClose, onSubmit, initialValue, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        title: initialValue.title,
        messageBody: initialValue.messageBody,
        audience: initialValue.audience,
        publicationMode: initialValue.status === 'ACTIVE' ? 'PUBLISH_NOW' : initialValue.status === 'SCHEDULED' ? 'SCHEDULE' : 'DRAFT',
        scheduledFor: initialValue.scheduledFor ? initialValue.scheduledFor.slice(0, 16) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialValue, isOpen]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      scheduledFor: form.publicationMode === 'SCHEDULE' ? new Date(form.scheduledFor).toISOString() : null,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? 'Edit Announcement' : 'Create Announcement'}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-control" value={form.title} onChange={(event) => update('title', event.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-control" value={form.messageBody} onChange={(event) => update('messageBody', event.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Target audience</label>
          <select className="form-control" value={form.audience} onChange={(event) => update('audience', event.target.value)}>
            <option value="ALL_USERS">All Users</option>
            <option value="CLIENTS">Clients</option>
            <option value="SERVICE_PROVIDERS">Service Providers</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Publication</label>
          <select className="form-control" value={form.publicationMode} onChange={(event) => update('publicationMode', event.target.value)}>
            <option value="DRAFT">Save as draft</option>
            <option value="PUBLISH_NOW">Publish immediately</option>
            <option value="SCHEDULE">Schedule for later</option>
          </select>
        </div>

        {form.publicationMode === 'SCHEDULE' && (
          <div className="form-group">
            <label className="form-label">Scheduled date and time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.scheduledFor}
              onChange={(event) => update('scheduledFor', event.target.value)}
              required
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
