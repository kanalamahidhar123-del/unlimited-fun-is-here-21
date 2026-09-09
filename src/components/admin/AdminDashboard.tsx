import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  IndianRupee,
  Eye,
  RefreshCw,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import {
  getBookings,
  updateBookingStatus,
  deleteBooking,
  clearAllBookings,
  getDashboardStats,
  getSystemPaymentMode,
  setSystemPaymentMode,
  type BookingRecord,
  type SystemPaymentMode,
} from '@/lib/bookingStore';
import BookingDetailsModal from './BookingDetailsModal';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'overview' | 'all-bookings' | 'rfid'>('overview');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [stats, setStats] = useState(getDashboardStats());
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [sysMode, setSysMode] = useState<SystemPaymentMode>(getSystemPaymentMode());

  // Filters & Search
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const refreshData = () => {
    const list = getBookings();
    setBookings(list);
    setStats(getDashboardStats());
    setSysMode(getSystemPaymentMode());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('unlimited_fun_bookings_updated', handleUpdate);
    window.addEventListener('unlimited_fun_payment_mode_updated', handleUpdate);
    return () => {
      window.removeEventListener('unlimited_fun_bookings_updated', handleUpdate);
      window.removeEventListener('unlimited_fun_payment_mode_updated', handleUpdate);
    };
  }, []);

  const handleToggleMode = (newMode: SystemPaymentMode) => {
    setSystemPaymentMode(newMode);
    setSysMode(newMode);
    showToast(`Website Mode changed to: ${newMode === 'REGISTRATION_ONLY' ? 'Registration-Only (No Online Payment)' : 'Payment Required (Razorpay Live)'}`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirmPayment = (id: string) => {
    const success = updateBookingStatus(id, 'Successful', 'Confirmed');
    if (success) {
      refreshData();
      showToast('Payment confirmed! Booking marked as Confirmed.');
    }
  };

  const handleRejectPayment = (id: string) => {
    const success = updateBookingStatus(id, 'Failed', 'Cancelled');
    if (success) {
      refreshData();
      showToast('Payment rejected. Booking marked as Cancelled.');
    }
  };

  const handleDeleteBooking = (id: string, name?: string) => {
    const confirmMsg = name
      ? `Are you sure you want to delete the booking for "${name}"? This action cannot be undone.`
      : 'Are you sure you want to delete this booking? This action cannot be undone.';
    if (window.confirm(confirmMsg)) {
      const success = deleteBooking(id);
      if (success) {
        if (selectedBooking && (selectedBooking.id === id || selectedBooking.booking_id === id)) {
          setSelectedBooking(null);
        }
        refreshData();
        showToast('Booking deleted successfully.');
      }
    }
  };

  const handleClearAllBookings = () => {
    if (bookings.length === 0) {
      showToast('No booking records to clear.');
      return;
    }
    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to permanently delete ALL ${bookings.length} customer booking records? This will clear all details from the Admin Dashboard.`
    );
    if (confirmed) {
      clearAllBookings();
      setSelectedBooking(null);
      refreshData();
      showToast('All customer booking records have been cleared.');
    }
  };

  // Filtered Bookings logic
  const filteredBookings = bookings.filter((b) => {
    if (tab === 'rfid' && b.type !== 'RFID') return false;

    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      const matchName = b.full_name?.toLowerCase().includes(q);
      const matchPhone = b.mobile_number?.includes(q);
      const matchWhatsapp = b.whatsapp_number?.includes(q);
      const matchEmail = b.email?.toLowerCase().includes(q);
      const matchId = b.booking_id?.toLowerCase().includes(q);
      const matchCategory = b.category?.toLowerCase().includes(q);
      const matchUtr = b.utr?.toLowerCase().includes(q);
      const matchNotes = b.special_request?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchWhatsapp && !matchEmail && !matchId && !matchCategory && !matchUtr && !matchNotes) return false;
    }

    // Payment Filter
    if (paymentFilter !== 'ALL' && b.payment_status !== paymentFilter) return false;

    // Booking Status Filter
    if (bookingStatusFilter !== 'ALL' && b.booking_status !== bookingStatusFilter) return false;

    // Date Filter
    if (dateFilter && b.visit_date !== dateFilter) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-ink-950 font-body text-ink-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-ink-900/95 backdrop-blur-md border-b border-ink-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-volt-500/10 border border-volt-500/30 flex items-center justify-center text-volt-400 font-black">
            UF
          </div>
          <div>
            <h1 className="font-display font-black text-base sm:text-lg text-white leading-none">
              <span className="text-volt-500">UNLIMITED FUN</span> ADMIN
            </h1>
            <p className="text-[11px] text-ink-400 font-mono mt-0.5">
              Secure Management Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-ink-950 p-1 rounded-xl border border-ink-800 text-xs font-bold">
            <button
              onClick={() => handleToggleMode('PAYMENT_REQUIRED')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                sysMode === 'PAYMENT_REQUIRED'
                  ? 'bg-volt-500 text-ink-950 shadow-sm'
                  : 'text-ink-400 hover:text-white'
              }`}
              title="Customers pay online via Razorpay"
            >
              💳 Payment Required
            </button>
            <button
              onClick={() => handleToggleMode('REGISTRATION_ONLY')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                sysMode === 'REGISTRATION_ONLY'
                  ? 'bg-cyan-500 text-ink-950 shadow-sm'
                  : 'text-ink-400 hover:text-white'
              }`}
              title="Online payment disabled - registration details only"
            >
              📝 Registration Only
            </button>
          </div>

          <button
            onClick={refreshData}
            title="Refresh Data"
            className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white text-xs font-bold transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleClearAllBookings}
            title="Clear all booking records"
            className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-flame-500/10 hover:bg-flame-500/20 text-flame-400 border border-flame-500/30 text-xs font-bold transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-ink-800 hover:bg-flame-500/20 hover:text-flame-400 border border-ink-700 px-3.5 py-2 text-xs font-bold text-ink-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-emerald-500 text-ink-950 font-bold px-4 py-3 shadow-2xl flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-ink-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setTab('overview')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'overview'
                ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                : 'bg-ink-900 text-ink-300 hover:text-white hover:bg-ink-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            OVERVIEW
          </button>
          <button
            onClick={() => setTab('all-bookings')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'all-bookings'
                ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                : 'bg-ink-900 text-ink-300 hover:text-white hover:bg-ink-800'
            }`}
          >
            <CalendarCheck2 className="h-4 w-4" />
            ALL BOOKINGS ({bookings.length})
          </button>
          <button
            onClick={() => setTab('rfid')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === 'rfid'
                ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                : 'bg-ink-900 text-ink-300 hover:text-white hover:bg-ink-800'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            RFID CARDS ({stats.totalRfidBookings})
          </button>
        </div>

        {/* 1. OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Total Revenue (Actual paid amount of successful payments only) */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-2 rounded-2xl bg-gradient-to-br from-ink-900 via-ink-900 to-volt-950/40 border border-volt-500/40 p-6 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-volt-400">
                    Verified Total Revenue
                  </span>
                  <div className="h-8 w-8 rounded-full bg-volt-500/10 flex items-center justify-center text-volt-400">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                </div>
                <div className="my-3">
                  <span className="font-display font-black text-3xl sm:text-4xl text-white">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-ink-400">
                  Calculated from <strong>{stats.successfulPayments} verified actual payments</strong>. Pending & unverified amounts are not counted.
                </p>
              </div>

              {/* Total Bookings */}
              <div className="rounded-2xl bg-ink-900 border border-ink-800 p-5 flex flex-col justify-between shadow-sm">
                <span className="text-xs font-bold text-ink-400 uppercase tracking-wide">
                  Total Bookings
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl text-white my-2">
                  {stats.totalBookings}
                </span>
                <span className="text-[11px] text-ink-400">{stats.todayBookings} today</span>
              </div>

              {/* Pending Payments (Yellow) */}
              <div className="rounded-2xl bg-ink-900 border border-amber-500/30 p-5 flex flex-col justify-between shadow-sm">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Pending Verification
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl text-amber-400 my-2">
                  {stats.pendingPayments}
                </span>
                <span className="text-[11px] text-ink-400">Requires review</span>
              </div>

              {/* Successful Payments (Green) */}
              <div className="rounded-2xl bg-ink-900 border border-emerald-500/30 p-5 flex flex-col justify-between shadow-sm">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Successful
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl text-emerald-400 my-2">
                  {stats.successfulPayments}
                </span>
                <span className="text-[11px] text-ink-400">{stats.confirmedBookings} confirmed</span>
              </div>

              {/* Failed / Rejected Payments (Red) */}
              <div className="rounded-2xl bg-ink-900 border border-flame-500/30 p-5 flex flex-col justify-between shadow-sm">
                <span className="text-xs font-bold text-flame-400 uppercase tracking-wide flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> Rejected / Failed
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl text-flame-400 my-2">
                  {stats.failedPayments}
                </span>
                <span className="text-[11px] text-ink-400">{stats.cancelledBookings} cancelled</span>
              </div>

              {/* Total RFID Bookings */}
              <div className="rounded-2xl bg-ink-900 border border-ink-800 p-5 flex flex-col justify-between shadow-sm">
                <span className="text-xs font-bold text-ink-400 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-volt-500" /> RFID Passes
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl text-white my-2">
                  {stats.totalRfidBookings}
                </span>
                <span className="text-[11px] text-ink-400">Basic & Premium</span>
              </div>
            </div>

            {/* Recent Bookings Queue */}
            <div className="rounded-3xl bg-ink-900 border border-ink-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-800">
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    Recent Booking Submissions
                  </h3>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Compare booking total vs actual paid amount before confirming
                  </p>
                </div>
                <button
                  onClick={() => setTab('all-bookings')}
                  className="text-xs font-bold text-volt-400 hover:text-volt-300"
                >
                  View All →
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 text-ink-500 text-sm">
                  No bookings submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 8).map((b) => {
                    const isRegistration = b.payment_method === 'Registration Only' || b.payment_status === 'Not Required';
                    const isUnderpaid = !isRegistration && b.paid_amount < b.booking_amount;
                    return (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-ink-950/60 border border-ink-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ink-700 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-volt-400 bg-volt-500/10 px-2 py-0.5 rounded border border-volt-500/30">
                              {b.booking_id}
                            </span>
                            <span className="text-xs font-bold text-white">{b.full_name}</span>
                            <span className="text-xs text-ink-400">({b.mobile_number})</span>
                            {b.email && (
                              <span className="text-xs text-ink-500 hidden md:inline">· {b.email}</span>
                            )}
                          </div>
                          <div className="text-xs text-ink-400">
                            {b.category} {b.duration !== 'N/A' && `(${b.duration})`} · {b.quantity} {b.type === 'RFID' ? 'Cards' : 'Guests'} · {b.visit_date} at {b.preferred_time}
                          </div>
                          {b.special_request && (
                            <div className="text-[11px] text-ink-400 italic">
                              Note: {b.special_request}
                            </div>
                          )}
                          {!isRegistration && b.utr && b.utr !== 'N/A' && (
                            <div className="text-[11px] font-mono text-ink-500">
                              UTR: <span className="text-ink-300">{b.utr}</span>
                            </div>
                          )}
                        </div>

                        {/* Amount Comparison */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[10px] text-ink-500">
                              Booking: ₹{b.booking_amount.toLocaleString('en-IN')}
                            </div>
                            <div className={`font-display font-black text-lg ${isRegistration ? 'text-ink-400' : 'text-volt-400'} flex items-center justify-end gap-1`}>
                              <span>{isRegistration ? 'Registration Only' : `Paid: ₹${b.paid_amount.toLocaleString('en-IN')}`}</span>
                              {isUnderpaid && (
                                <span title="Underpaid" className="text-xs text-amber-400">⚠️</span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              b.payment_status === 'Successful'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : b.payment_status === 'Not Required'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                : b.payment_status === 'Failed'
                                ? 'bg-flame-500/10 text-flame-400 border border-flame-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {b.payment_status === 'Successful' && '🟢 Successful'}
                            {b.payment_status === 'Not Required' && '📝 Registered'}
                            {b.payment_status === 'Failed' && '🔴 Failed'}
                            {b.payment_status === 'Pending Verification' && '🟡 Pending'}
                          </span>

                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-xs font-semibold text-ink-200 hover:text-white"
                          >
                            Details
                          </button>

                          {b.booking_status !== 'Confirmed' && (
                            <button
                              onClick={() => handleConfirmPayment(b.id)}
                              title="Verify & Confirm Booking"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-ink-950 text-emerald-400 border border-emerald-500/30 transition-all"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          {b.booking_status !== 'Cancelled' && (
                            <button
                              onClick={() => handleRejectPayment(b.id)}
                              title="Cancel / Reject Booking"
                              className="p-1.5 rounded-lg bg-flame-500/10 hover:bg-flame-500 hover:text-white text-flame-400 border border-flame-500/30 transition-all"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBooking(b.id, b.full_name)}
                            title="Delete this booking"
                            className="p-1.5 rounded-lg bg-ink-800 hover:bg-flame-500/20 text-ink-400 hover:text-flame-400 border border-ink-700 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ALL BOOKINGS & RFID TABS */}
        {(tab === 'all-bookings' || tab === 'rfid') && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="rounded-3xl bg-ink-900 border border-ink-800 p-5 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, ID, UTR..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl bg-ink-950 border border-ink-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-ink-500 focus:border-volt-500 focus:outline-none"
                  />
                </div>

                {/* Payment Status Filter */}
                <div>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="w-full rounded-xl bg-ink-950 border border-ink-700 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-volt-500 focus:outline-none"
                  >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="Pending Verification">🟡 Pending Verification</option>
                    <option value="Successful">🟢 Successful</option>
                    <option value="Not Required">⚪ Not Required</option>
                    <option value="Failed">🔴 Failed</option>
                  </select>
                </div>

                {/* Booking Status Filter */}
                <div>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="w-full rounded-xl bg-ink-950 border border-ink-700 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-volt-500 focus:outline-none"
                  >
                    <option value="ALL">All Booking Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Registration Received">Registration Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full rounded-xl bg-ink-950 border border-ink-700 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-volt-500 focus:outline-none"
                  />
                </div>
              </div>

              {(search || paymentFilter !== 'ALL' || bookingStatusFilter !== 'ALL' || dateFilter) && (
                <div className="flex items-center justify-between text-xs text-ink-400 pt-1">
                  <span>Showing {filteredBookings.length} filtered results</span>
                  <button
                    onClick={() => {
                      setSearch('');
                      setPaymentFilter('ALL');
                      setBookingStatusFilter('ALL');
                      setDateFilter('');
                    }}
                    className="text-volt-400 hover:text-volt-300 font-bold"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Bookings Table */}
            <div className="rounded-3xl bg-ink-900 border border-ink-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-ink-950/80 text-ink-400 uppercase text-[10px] sm:text-xs font-bold tracking-wider border-b border-ink-800">
                    <tr>
                      <th className="px-5 py-4">Booking ID</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Package / Category</th>
                      <th className="px-5 py-4">Date & Time</th>
                      <th className="px-5 py-4">Payment Method</th>
                      <th className="px-5 py-4">Booking Amount</th>
                      <th className="px-5 py-4">Actual Paid Amount</th>
                      <th className="px-5 py-4">Payment / UTR Ref</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-800/60">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-ink-500">
                          No matching bookings found.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const isRegistration = b.payment_method === 'Registration Only' || b.payment_status === 'Not Required';
                        const isUnderpaid = !isRegistration && b.paid_amount < b.booking_amount;
                        const isRazorpay = b.payment_method === 'Razorpay' || Boolean(b.razorpay_payment_id);
                        return (
                          <tr key={b.id} className="hover:bg-ink-800/30 transition-colors">
                            {/* Booking ID */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-mono text-xs font-bold text-volt-400 bg-volt-500/10 px-2 py-0.5 rounded border border-volt-500/30">
                                {b.booking_id}
                              </span>
                              <div className="text-[10px] text-ink-500 mt-1">
                                {new Date(b.created_at).toLocaleDateString()}
                              </div>
                            </td>

                            {/* Customer Details */}
                            <td className="px-5 py-4">
                              <div className="font-bold text-white">{b.full_name}</div>
                              <div className="text-xs text-ink-400">{b.mobile_number}</div>
                              {b.email && (
                                <div className="text-[11px] text-ink-500 truncate max-w-[140px]">{b.email}</div>
                              )}
                            </td>

                            {/* Package */}
                            <td className="px-5 py-4">
                              <div className="font-semibold text-ink-200">{b.category}</div>
                              <div className="text-xs text-ink-400">
                                {b.duration !== 'N/A' && `${b.duration} · `}
                                {b.quantity} {b.type === 'RFID' ? 'Cards' : 'Guests'}
                              </div>
                            </td>

                            {/* Visit Slot */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="font-medium text-ink-200">{b.visit_date}</div>
                              <div className="text-xs text-ink-400">{b.preferred_time}</div>
                            </td>

                            {/* Method */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                isRegistration
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                  : isRazorpay
                                  ? 'bg-volt-500/10 text-volt-400 border-volt-500/30'
                                  : 'bg-ink-800 text-ink-300 border-ink-700'
                              }`}>
                                {isRegistration ? '📝 Registration Only' : isRazorpay ? '⚡ Razorpay' : '📱 UPI Manual'}
                              </span>
                            </td>

                            {/* Booking Amount (Expected) */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-semibold text-ink-300">
                                ₹{b.booking_amount.toLocaleString('en-IN')}
                              </span>
                            </td>

                            {/* Actual Paid Amount */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-display font-black text-sm sm:text-base ${
                                  isRegistration ? 'text-ink-400' : isUnderpaid ? 'text-amber-400' : 'text-volt-400'
                                }`}>
                                  ₹{b.paid_amount.toLocaleString('en-IN')}
                                </span>
                                {isUnderpaid && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" title={`Short by ₹${b.booking_amount - b.paid_amount}`}>
                                    Short
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* UTR / Razorpay ID */}
                            <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-ink-300">
                              <span className="bg-ink-950 px-2 py-1 rounded border border-ink-800 max-w-[140px] truncate inline-block">
                                {b.razorpay_payment_id || b.utr || 'N/A'}
                              </span>
                            </td>

                            {/* Payment Status Badge */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  b.payment_status === 'Successful'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : b.payment_status === 'Not Required'
                                    ? 'bg-ink-800 text-ink-300 border border-ink-700'
                                    : b.payment_status === 'Failed'
                                    ? 'bg-flame-500/10 text-flame-400 border border-flame-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {b.payment_status === 'Successful' && '🟢 Successful'}
                                {b.payment_status === 'Not Required' && '⚪ Not Required'}
                                {b.payment_status === 'Failed' && '🔴 Failed'}
                                {b.payment_status === 'Pending Verification' && '🟡 Pending'}
                              </span>
                              <div className="text-[10px] text-ink-400 mt-1">
                                Booking: <span className="font-semibold text-ink-300">{b.booking_status}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  title="View Details"
                                  className="p-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {b.booking_status !== 'Confirmed' && (
                                  <button
                                    onClick={() => handleConfirmPayment(b.id)}
                                    title="Verify & Confirm Booking"
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-ink-950 text-emerald-400 border border-emerald-500/30 transition-all"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                )}
                                {b.booking_status !== 'Cancelled' && (
                                  <button
                                    onClick={() => handleRejectPayment(b.id)}
                                    title="Cancel / Reject Booking"
                                    className="p-1.5 rounded-lg bg-flame-500/10 hover:bg-flame-500 hover:text-white text-flame-400 border border-flame-500/30 transition-all"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteBooking(b.id, b.full_name)}
                                  title="Delete this booking permanently"
                                  className="p-1.5 rounded-lg bg-ink-800 hover:bg-flame-500/20 text-ink-400 hover:text-flame-400 border border-ink-700 transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleConfirmPayment}
          onReject={handleRejectPayment}
          onDelete={handleDeleteBooking}
        />
      )}
    </div>
  );
}
