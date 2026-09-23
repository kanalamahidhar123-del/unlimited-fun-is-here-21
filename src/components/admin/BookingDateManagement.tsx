import React, { useState, useEffect } from 'react';
import {
  DAILY_CAPACITY,
  getDateConfig,
  saveDateConfig,
  fetchDateConfigFromServer,
  isDateOpen,
  getDateBookingCount,
  getBookings,
  toggleDateStatusRemote,
  openMonthRemote,
  closeMonthRemote,
  BookingRecord,
  formatFriendlyDate,
} from '@/lib/bookingStore';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Users,
  RefreshCw,
  Search,
  Sparkles,
  Info,
  CalendarCheck2,
  CalendarX2,
} from 'lucide-react';

export const BookingDateManagement: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [config, setConfig] = useState(getDateConfig());
  const [bookings, setBookings] = useState<BookingRecord[]>(getBookings());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAddMonthModalOpen, setIsAddMonthModalOpen] = useState(false);
  const [customMonthYear, setCustomMonthYear] = useState<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const refreshData = async () => {
    setLoading(true);
    try {
      const freshConfig = await fetchDateConfigFromServer();
      setConfig(freshConfig);
      setBookings(getBookings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => {
      setConfig(getDateConfig());
      setBookings(getBookings());
    };
    window.addEventListener('unlimited_fun_date_config_updated', handleUpdate);
    window.addEventListener('unlimited_fun_bookings_updated', handleUpdate);
    return () => {
      window.removeEventListener('unlimited_fun_date_config_updated', handleUpdate);
      window.removeEventListener('unlimited_fun_bookings_updated', handleUpdate);
    };
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const ymStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const isCurrentMonthOpened = config.openedMonths.includes(ymStr);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleToggleDate = async (dateStr: string, currentIsOpen: boolean) => {
    const newStatus = !currentIsOpen;
    await toggleDateStatusRemote(dateStr, newStatus);
    setConfig(getDateConfig());
    showFeedback(
      'success',
      `Date ${dateStr} is now ${newStatus ? 'OPEN (Accepting Bookings)' : 'CLOSED (Blocked)'}`
    );
  };

  const handleOpenEntireMonth = async (y: number, m: number) => {
    await openMonthRemote(y, m);
    setConfig(getDateConfig());
    const mName = new Date(y, m - 1, 1).toLocaleString('default', { month: 'long' });
    showFeedback('success', `All dates in ${mName} ${y} have been OPENED for bookings!`);
  };

  const handleCloseEntireMonth = async (y: number, m: number) => {
    if (!confirm(`Are you sure you want to close the entire month of ${new Date(y, m - 1, 1).toLocaleString('default', { month: 'long' })} ${y}? Customers will not be able to book these dates.`)) {
      return;
    }
    await closeMonthRemote(y, m);
    setConfig(getDateConfig());
    const mName = new Date(y, m - 1, 1).toLocaleString('default', { month: 'long' });
    showFeedback('success', `Month ${mName} ${y} has been CLOSED.`);
  };

  const handleBatchOpenNextMonths = async (count: number) => {
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      await openMonthRemote(d.getFullYear(), d.getMonth() + 1);
    }
    setConfig(getDateConfig());
    showFeedback('success', `Successfully opened the next ${count} months for customer bookings!`);
    setIsAddMonthModalOpen(false);
  };

  // Calendar Grid generation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    isOpen: boolean;
    isSunday: boolean;
    bookedCount: number;
    isFull: boolean;
    isPast: boolean;
    isToday: boolean;
  }> = [];

  const todayStr = new Date().toISOString().split('T')[0];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dObj = new Date(year, month, day);
    const isSunday = dObj.getDay() === 0;
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;
    const isOpen = isDateOpen(dateStr);
    const bookedCount = getDateBookingCount(dateStr);
    const isFull = bookedCount >= DAILY_CAPACITY;

    calendarDays.push({
      dayNumber: day,
      dateStr,
      isOpen,
      isSunday,
      bookedCount,
      isFull,
      isPast,
      isToday,
    });
  }

  // Selected Date Bookings list
  const selectedDateBookings = selectedDate
    ? bookings.filter((b) => {
        const bDate = b.visit_date || (b.created_at ? b.created_at.split('T')[0] : '');
        return bDate === selectedDate && b.booking_status !== 'Cancelled' && b.payment_status !== 'Failed';
      })
    : [];

  const selectedDateObj = selectedDate ? calendarDays.find((d) => d.dateStr === selectedDate) : null;

  // Stats calculation
  const todayBooked = getDateBookingCount(todayStr);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const tomorrowBooked = getDateBookingCount(tomorrowStr);

  const totalClosedDates = config.closedDates.length;
  const openedMonthsList = config.openedMonths.slice().sort();

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-800/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-electric-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                BOOKING DATE MANAGEMENT
              </h2>
              <p className="text-gray-400 text-sm">
                Control customer booking availability, open future months, and enforce the 300 daily capacity limit.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddMonthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-neon-500 to-emerald-500 text-dark-900 font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-neon-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            Add More Booking Dates
          </button>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-dark-700 text-gray-300 hover:text-white rounded-xl text-sm border border-white/10 hover:border-white/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-flame-500/10 border-flame-500/30 text-flame-400'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Quick Summary Cards (Today, Tomorrow, Capacity Rules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Daily Capacity Limit */}
        <div className="bg-dark-800/60 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>MAX DAILY CAPACITY</span>
            <Users className="w-4 h-4 text-electric-400" />
          </div>
          <div className="text-2xl font-black text-white">300 <span className="text-xs font-normal text-gray-400">Bookings / Day</span></div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Auto-blocks when 300 is reached
          </div>
        </div>

        {/* Card 2: Today's Status */}
        <div className="bg-dark-800/60 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>TODAY ({todayStr})</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              todayBooked >= DAILY_CAPACITY
                ? 'bg-flame-500/20 text-flame-400 border border-flame-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {todayBooked >= DAILY_CAPACITY ? 'FULL' : 'OPEN'}
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {todayBooked} <span className="text-gray-400 text-sm font-normal">/ 300</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {Math.max(0, DAILY_CAPACITY - todayBooked)} slots remaining
          </div>
        </div>

        {/* Card 3: Tomorrow's Status */}
        <div className="bg-dark-800/60 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>TOMORROW ({tomorrowStr})</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              tomorrowBooked >= DAILY_CAPACITY
                ? 'bg-flame-500/20 text-flame-400 border border-flame-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {tomorrowBooked >= DAILY_CAPACITY ? 'FULL' : 'OPEN'}
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {tomorrowBooked} <span className="text-gray-400 text-sm font-normal">/ 300</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {Math.max(0, DAILY_CAPACITY - tomorrowBooked)} slots remaining
          </div>
        </div>

        {/* Card 4: Active Open Months */}
        <div className="bg-dark-800/60 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>OPENED MONTHS</span>
            <CalendarCheck2 className="w-4 h-4 text-neon-400" />
          </div>
          <div className="text-2xl font-black text-neon-400">
            {openedMonthsList.length} <span className="text-xs font-normal text-gray-400">Months Active</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 truncate">
            {openedMonthsList.join(', ')}
          </div>
        </div>
      </div>

      {/* Main Calendar Navigation Header */}
      <div className="bg-dark-800/90 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-dark-700 text-gray-300 hover:text-white hover:bg-dark-600 transition-colors border border-white/10"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center sm:text-left">
              <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">
                {monthName} {year}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                <span>Month Status:</span>
                {isCurrentMonthOpened ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Open for Bookings
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-flame-400 font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Closed / Not Added
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-dark-700 text-gray-300 hover:text-white hover:bg-dark-600 transition-colors border border-white/10"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg bg-dark-700 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors"
            >
              Today
            </button>
            
            {isCurrentMonthOpened ? (
              <button
                onClick={() => handleCloseEntireMonth(year, month + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-flame-500/10 text-flame-400 hover:bg-flame-500/20 border border-flame-500/30 text-xs font-bold transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Close Entire Month
              </button>
            ) : (
              <button
                onClick={() => handleOpenEntireMonth(year, month + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold transition-all"
              >
                <Unlock className="w-3.5 h-3.5" />
                Open All {monthName} {year}
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-gray-400 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500"></span>
            <span>Available (&lt; 300)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-flame-500/30 border border-flame-500"></span>
            <span>Fully Booked (300 / 300)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"></span>
            <span>Closed / Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500"></span>
            <span>Sunday (Pre-booking only)</span>
          </div>
        </div>

        {/* Calendar Day-of-Week Headers */}
        <div className="grid grid-cols-7 gap-2 mt-4 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div
              key={d}
              className={`text-xs font-bold uppercase tracking-wider py-2 rounded-lg ${
                i === 0 ? 'text-amber-400 bg-amber-500/5' : 'text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-2 mt-2">
          {/* Empty offset padding for days before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-xl bg-dark-900/30 border border-transparent"></div>
          ))}

          {/* Actual Month Days */}
          {calendarDays.map((day) => {
            const isSelected = selectedDate === day.dateStr;

            let cardBorder = 'border-white/10 hover:border-white/30';
            let cardBg = 'bg-dark-900/60';
            let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            let badgeText = `${day.bookedCount} / 300`;

            if (!day.isOpen) {
              cardBg = 'bg-dark-950/80 opacity-60';
              badgeBg = 'bg-gray-700/50 text-gray-400 border-gray-600/40';
              badgeText = 'CLOSED';
            } else if (day.isFull) {
              cardBg = 'bg-flame-950/40';
              cardBorder = 'border-flame-500/40';
              badgeBg = 'bg-flame-500/20 text-flame-400 border-flame-500/40';
              badgeText = 'FULL (300)';
            } else if (day.bookedCount > 0) {
              cardBg = 'bg-dark-800/90';
              badgeBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
              badgeText = `${day.bookedCount} / 300`;
            }

            if (isSelected) {
              cardBorder = 'ring-2 ring-electric-400 border-electric-400 shadow-lg shadow-electric-500/20';
            }

            return (
              <div
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`relative flex flex-col justify-between p-2 sm:p-2.5 h-24 sm:h-28 rounded-xl border transition-all cursor-pointer select-none ${cardBg} ${cardBorder}`}
              >
                {/* Header: Day Number + Today Badge + Sunday Indicator */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        day.isToday
                          ? 'w-6 h-6 rounded-full bg-electric-500 text-white flex items-center justify-center text-xs'
                          : day.isSunday
                          ? 'text-amber-400 font-bold'
                          : 'text-white'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.isSunday && (
                      <span className="text-[10px] text-amber-400 font-medium hidden sm:inline" title="Sunday pre-booking only">
                        Sun
                      </span>
                    )}
                  </div>

                  {/* 1-Click Quick Toggle Lock Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDate(day.dateStr, day.isOpen);
                    }}
                    title={day.isOpen ? 'Click to Close / Block this date' : 'Click to Open this date'}
                    className={`p-1 rounded-md transition-colors ${
                      day.isOpen
                        ? 'text-emerald-400 hover:text-flame-400 hover:bg-flame-500/10'
                        : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {day.isOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Body / Count Badge */}
                <div className="mt-auto">
                  <div
                    className={`inline-flex items-center justify-center w-full px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold border truncate ${badgeBg}`}
                  >
                    {badgeText}
                  </div>
                  {day.isOpen && !day.isFull && day.bookedCount > 0 && (
                    <div className="text-[9px] text-gray-400 text-center mt-0.5 hidden sm:block">
                      {DAILY_CAPACITY - day.bookedCount} left
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Inspector Panel */}
      {selectedDate && selectedDateObj && (
        <div className="bg-dark-800/90 border border-electric-500/30 rounded-2xl p-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">
                  {formatFriendlyDate(selectedDate)}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    !selectedDateObj.isOpen
                      ? 'bg-gray-700 text-gray-300 border-gray-600'
                      : selectedDateObj.isFull
                      ? 'bg-flame-500/20 text-flame-400 border-flame-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {!selectedDateObj.isOpen ? '⛔ CLOSED' : selectedDateObj.isFull ? '🔴 FULL (300/300)' : '🟢 OPEN (Available)'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Total Bookings: <span className="text-white font-bold">{selectedDateObj.bookedCount}</span> / {DAILY_CAPACITY} max capacity
                ({Math.max(0, DAILY_CAPACITY - selectedDateObj.bookedCount)} spots remaining)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleDate(selectedDate, selectedDateObj.isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDateObj.isOpen
                    ? 'bg-flame-500/10 text-flame-400 hover:bg-flame-500/20 border border-flame-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                }`}
              >
                {selectedDateObj.isOpen ? (
                  <>
                    <Lock className="w-4 h-4" /> Close / Block This Date
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" /> Open This Date for Bookings
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="px-3 py-2 bg-dark-700 text-gray-400 hover:text-white rounded-xl text-xs"
              >
                Close Panel
              </button>
            </div>
          </div>

          {/* Customer list on this date */}
          <div className="mt-4">
            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-electric-400" />
              Registered Customer Bookings on {selectedDate} ({selectedDateBookings.length})
            </h4>

            {selectedDateBookings.length === 0 ? (
              <div className="p-8 text-center bg-dark-900/40 rounded-xl border border-white/5 text-gray-400 text-sm">
                No customer bookings registered for this date yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase bg-dark-900/60">
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Time Slot</th>
                      <th className="p-3">Guests</th>
                      <th className="p-3">Package / Activity</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedDateBookings.map((b) => (
                      <tr key={b.id || b.booking_id} className="hover:bg-white/5">
                        <td className="p-3 font-mono text-electric-400 font-bold">{b.booking_id}</td>
                        <td className="p-3 font-semibold text-white">{b.full_name}</td>
                        <td className="p-3 text-gray-300">{b.mobile_number}</td>
                        <td className="p-3 text-gray-300">{b.preferred_time}</td>
                        <td className="p-3 text-gray-300 font-bold">
                          {(b.adults || 0) + (b.children || 0) || b.quantity || 1}
                        </td>
                        <td className="p-3 text-gray-300">{b.category} ({b.duration})</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {b.booking_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add More Booking Dates / Future Months Modal */}
      {isAddMonthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-500/20 text-neon-400 flex items-center justify-center font-bold">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Add More Booking Dates</h3>
                  <p className="text-xs text-gray-400">Enable future months for customer bookings</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMonthModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Quick 1-Click Month Openers
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleBatchOpenNextMonths(3)}
                  className="p-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-white/10 text-left transition-all group"
                >
                  <div className="text-sm font-bold text-white group-hover:text-neon-400">Open Next 3 Months</div>
                  <div className="text-xs text-gray-400 mt-0.5">Opens all dates for next 90 days</div>
                </button>
                <button
                  onClick={() => handleBatchOpenNextMonths(6)}
                  className="p-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-white/10 text-left transition-all group"
                >
                  <div className="text-sm font-bold text-white group-hover:text-neon-400">Open Next 6 Months</div>
                  <div className="text-xs text-gray-400 mt-0.5">Opens all dates for next 180 days</div>
                </button>
                <button
                  onClick={() => handleBatchOpenNextMonths(12)}
                  className="p-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-white/10 text-left transition-all group col-span-2"
                >
                  <div className="text-sm font-bold text-white group-hover:text-neon-400">Open Full Next 1 Year (12 Months)</div>
                  <div className="text-xs text-gray-400 mt-0.5">Allows advance bookings for the entire upcoming year</div>
                </button>
              </div>
            </div>

            {/* Custom Specific Month Picker */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Open Specific Month & Year
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Select Month</label>
                  <select
                    value={customMonthYear.month}
                    onChange={(e) => setCustomMonthYear({ ...customMonthYear, month: Number(e.target.value) })}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                  >
                    {[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ].map((mName, idx) => (
                      <option key={mName} value={idx + 1}>{mName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Select Year</label>
                  <select
                    value={customMonthYear.year}
                    onChange={(e) => setCustomMonthYear({ ...customMonthYear, year: Number(e.target.value) })}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                  >
                    {[2026, 2027, 2028, 2029, 2030].map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={async () => {
                  await handleOpenEntireMonth(customMonthYear.year, customMonthYear.month);
                  setIsAddMonthModalOpen(false);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-neon-500 to-emerald-500 text-dark-900 font-bold rounded-xl text-sm hover:brightness-110 transition-all"
              >
                Open Selected Month Now
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsAddMonthModalOpen(false)}
                className="px-4 py-2 bg-dark-700 text-gray-300 hover:text-white rounded-xl text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
