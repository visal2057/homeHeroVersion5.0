import { useState, useEffect, useCallback } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import CompletedJobsTable from '../components/CompletedJobsTable.jsx';
import ProviderReviews   from '../components/ProviderReviews.jsx';
import ProviderPageHero  from '../components/ProviderPageHero.jsx';
import CreatePortfolioPostModal from '../components/CreatePortfolioPostModal.jsx';
import GenerateInvoiceModal from '../../invoices/components/GenerateInvoiceModal.jsx';
import { invoiceApi } from '../../invoices/invoiceApi.js';
import { IconAlertCircle } from '../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1650216600469-bb05741a636f?auto=format&fit=crop&w=1600&q=80';

export default function ProviderCompletedJobsPage() {
  const [jobs,    setJobs]    = useState([]);
  const [reviews, setReviews] = useState([]);
  const [postedBookingIds, setPostedBookingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('jobs');
  const [postBookingId, setPostBookingId] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [invoicedBookingIds, setInvoicedBookingIds] = useState(new Set());
  const [invoiceBookingId, setInvoiceBookingId] = useState(null);
  const [invoiceError, setInvoiceError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, reviewsRes, portfolioRes, invoicesRes] = await Promise.allSettled([
        axiosClient.get(API_ENDPOINTS.PROVIDER.COMPLETED_JOBS),
        axiosClient.get(API_ENDPOINTS.PROVIDER.REVIEWS),
        axiosClient.get(API_ENDPOINTS.PROVIDER.PORTFOLIO),
        invoiceApi.listMine(),
      ]);
      if (jobsRes.status === 'fulfilled') {
        const list = jobsRes.value.data?.data ?? jobsRes.value.data ?? [];
        setJobs(Array.isArray(list) ? list : []);
      }
      if (reviewsRes.status === 'fulfilled') {
        const list = reviewsRes.value.data?.data ?? reviewsRes.value.data ?? [];
        setReviews(Array.isArray(list) ? list : []);
      }
      if (portfolioRes.status === 'fulfilled') {
        const list = portfolioRes.value.data?.data ?? portfolioRes.value.data ?? [];
        setPostedBookingIds(new Set((Array.isArray(list) ? list : []).map((p) => p.bookingId)));
      }
      if (invoicesRes.status === 'fulfilled') {
        const list = invoicesRes.value.data?.data ?? invoicesRes.value.data ?? [];
        setInvoicedBookingIds(new Set(Array.isArray(list) ? list : []));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreatePost({ bookingId, title, description, images }) {
    setPosting(true);
    setPostError('');
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('title', title);
      formData.append('description', description);
      images.forEach((file) => formData.append('images', file));

      await axiosClient.post(API_ENDPOINTS.PROVIDER.PORTFOLIO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPostBookingId(null);
      await load();
    } catch (err) {
      setPostError(err.response?.data?.message ?? 'Could not create post. Please try again.');
    } finally {
      setPosting(false);
    }
  }

  async function handleDownloadInvoice(bookingId) {
    setInvoiceError('');
    try {
      const res = await invoiceApi.download(bookingId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-booking-${bookingId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setInvoiceError(err.response?.data?.message ?? 'Could not download the invoice.');
    }
  }

  return (
    <div className="provider-page">
      <ProviderPageHero
        title="Completed Jobs"
        subtitle="Your job history and client reviews."
        image={HERO_IMAGE}
      />

      {postError && (
        <div className="provider-alert error" style={{ marginBottom: 'var(--space-lg)' }}>
          <IconAlertCircle size={16} /> {postError}
        </div>
      )}
      {invoiceError && (
        <div className="provider-alert error" style={{ marginBottom: 'var(--space-lg)' }}>
          <IconAlertCircle size={16} /> {invoiceError}
        </div>
      )}

      {/* Tab switcher */}
      <div className="provider-tabs">
        <button
          type="button"
          className={`provider-tab${tab === 'jobs' ? ' active' : ''}`}
          onClick={() => setTab('jobs')}
        >
          Completed Jobs <span className="count">({jobs.length})</span>
        </button>
        <button
          type="button"
          className={`provider-tab${tab === 'reviews' ? ' active' : ''}`}
          onClick={() => setTab('reviews')}
        >
          Client Reviews <span className="count">({reviews.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : (
        <div className="provider-card">
          {tab === 'jobs' ? (
            <CompletedJobsTable
              jobs={jobs}
              postedBookingIds={postedBookingIds}
              onCreatePost={(bookingId) => { setPostError(''); setPostBookingId(bookingId); }}
              invoicedBookingIds={invoicedBookingIds}
              onGenerateInvoice={(bookingId) => { setInvoiceError(''); setInvoiceBookingId(bookingId); }}
              onDownloadInvoice={handleDownloadInvoice}
            />
          ) : (
            <div className="provider-card-body">
              <ProviderReviews reviews={reviews} />
            </div>
          )}
        </div>
      )}

      {postBookingId && (
        <CreatePortfolioPostModal
          bookingId={postBookingId}
          onClose={() => setPostBookingId(null)}
          onSave={handleCreatePost}
          saving={posting}
        />
      )}

      {invoiceBookingId && (
        <GenerateInvoiceModal
          bookingId={invoiceBookingId}
          onClose={() => setInvoiceBookingId(null)}
          onGenerated={async () => {
            setInvoiceBookingId(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
