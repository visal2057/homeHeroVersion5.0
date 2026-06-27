import { useEffect, useState } from 'react';
import AdminMetricCard from '../components/AdminMetricCard.jsx';
import RevenueBarChart from '../components/RevenueBarChart.jsx';
import BookingPieChart from '../components/BookingPieChart.jsx';
import RecentActionsList from '../components/RecentActionsList.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchDashboardOverview, downloadEarningsReport } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

function formatCurrency(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
}

export default function SystemAdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { showError, showSuccess } = useAlert();

  useEffect(() => {
    fetchDashboardOverview()
      .then(({ data }) => setOverview(data.data))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [showError]);

  async function handleGenerateReport() {
    const now = new Date();
    setIsDownloading(true);
    try {
      await downloadEarningsReport(now.getFullYear(), now.getMonth() + 1);
      showSuccess('Earnings report downloaded.');
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container admin-page text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">System Admin Dashboard</h1>
          <p className="section-subtitle">Platform health, revenue and activity at a glance.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleGenerateReport} disabled={isDownloading}>
          {isDownloading && <span className="btn-spinner" aria-hidden="true" />}
          {isDownloading ? 'Generating...' : 'Generate Earnings Report'}
        </button>
      </div>

      <div className="stat-grid">
        <AdminMetricCard label="Current Month Earnings" value={formatCurrency(overview.metrics.currentMonthEarnings)} />
        <AdminMetricCard label="Active Bookings" value={overview.metrics.activeBookings} accentColor="#0ea5e9" />
        <AdminMetricCard label="Verified Service Providers" value={overview.metrics.verifiedProviders} accentColor="#f59e0b" />
        <AdminMetricCard label="New Clients This Month" value={overview.metrics.newClientsThisMonth} accentColor="#8b5cf6" />
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <h3>Six-Month Revenue</h3>
          <RevenueBarChart data={overview.revenueChart} />
        </div>
        <div className="card chart-card">
          <h3>Booking Distribution</h3>
          <BookingPieChart active={overview.bookingDistribution.active} completed={overview.bookingDistribution.completed} />
        </div>
      </div>

      <div className="card chart-card">
        <h3>Recent Actions</h3>
        <RecentActionsList actions={overview.recentActions} />
      </div>
    </div>
  );
}
