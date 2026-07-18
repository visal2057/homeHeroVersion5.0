import { useEffect, useState } from 'react';
import AdminMetricCard from '../components/AdminMetricCard.jsx';
import { RevenueIcon, BookingsIcon, ProvidersIcon, ClientsIcon } from '../components/DashboardIcons.jsx';
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
        <div className="animate-fade-in-up delay-1">
          <AdminMetricCard
            label="Total Revenue"
            value={formatCurrency(overview.metrics.currentMonthEarnings)}
            sub="Revenue for the month"
            icon={<RevenueIcon />}
          />
        </div>
        <div className="animate-fade-in-up delay-2">
          <AdminMetricCard
            label="Active Bookings"
            value={overview.metrics.activeBookings}
            sub="Currently active requests"
            icon={<BookingsIcon />}
          />
        </div>
        <div className="animate-fade-in-up delay-3">
          <AdminMetricCard
            label="Verified Providers"
            value={overview.metrics.verifiedProviders}
            sub="Active service providers"
            icon={<ProvidersIcon />}
          />
        </div>
        <div className="animate-fade-in-up delay-4">
          <AdminMetricCard
            label="New Clients"
            value={overview.metrics.newClientsThisMonth}
            sub="New clients this month"
            icon={<ClientsIcon />}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card chart-card-interactive animate-fade-in-up delay-2">
          <div className="chart-card-header">
            <h3>Growth Trends</h3>
            <span className="chart-tag">Membership + Commission Revenue</span>
          </div>
          <RevenueBarChart data={overview.revenueChart} />
        </div>
        <div className="card chart-card chart-card-interactive animate-fade-in-up delay-3">
          <h3>Booking Distribution by Status</h3>
          <BookingPieChart statuses={overview.statusDistribution} />
        </div>
      </div>

      <div className="card chart-card animate-fade-in-up delay-4">
        <h3>Recent Activity</h3>
        <RecentActionsList actions={overview.recentActions} />
      </div>
    </div>
  );
}
