import { useState } from 'react';
import {
  Gauge,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  DAILY_CAPACITY,
  getDateBookingCount,
  isDateFull,
  getCapacitySummary,
  formatFriendlyDate,
  type BookingRecord,
} from '@/lib/bookingStore';

interface AdminCapacityTrackerProps {
  bookings: BookingRecord[];
  onSelectBooking: (booking: BookingRecord) => void;
}

export default function AdminCapacityTracker({
  bookings,
  onSelectBooking,
}: AdminCapacityTrackerProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [forecastDays, setForecastDays] = useState<number>(14);

  const capacitySummary = getCapacitySummary(forecastDays);

  const selectedDateBookings = bookings.filter((b) => {
    if (b.booking_status === 'Cancelled' || b.payment_status === 'Failed') return false;
    const bDate = b.visit_date || (b.created_at ? b.created_at.split('T')[0] : '');
    return bDate === selectedDate;
  });

  const selectedBookedCount = selectedDateBookings.length;
  const selectedRemaining = Math.max(0, DAILY_CAPACITY - selectedBookedCount);
  const isSelectedFull = selectedBookedCount >= DAILY_CAPACITY;
  const occupancyRate = Math.min(100, Math.round((selectedBookedCount / DAILY_CAPACITY) * 100));

  const totalGuestsOnSelectedDate = selectedDateBookings.reduce(
    (sum, b) => sum + (Number(b.quantity) || (b.adults || 0) + (b.children || 0) || 1),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-ink-900 border border-ink-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt-500/10 border border-volt-500/30 text-volt-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Gauge className="h-3.5 w-3.5" />
            <span>Capacity & Slot Management</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            📊 DAILY 50 <span className="text-volt-500">CAPACITY TRACKER</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-400 mt-1 max-w-2xl">
            Real-time tracking of daily 50 booking limits. Prevents overbooking and ensures visitor safety and park flow.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-ink-950 border border-ink-800 p-3 rounded-2xl">
          <Calendar className="h-4 w-4 text-volt-400 flex-shrink-0" />
          <div>
            <label className="block text-[10px] font-bold uppercase text-ink-400">Inspect Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Selected Date Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Limit */}
        <div className="rounded-2xl bg-ink-900 border border-ink-800 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-ink-400 uppercase tracking-wide">
            Daily Booking Capacity
          </span>
          <div className="my-2">
            <span className="font-display font-black text-3xl text-white">{DAILY_CAPACITY}</span>
            <span className="text-xs text-ink-400 ml-1.5">Max / Day</span>
          </div>
          <p className="text-[11px] text-ink-500">System enforced ceiling</p>
        </div>

        {/* Booked Slots */}
        <div className="rounded-2xl bg-ink-900 border border-ink-800 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-ink-400 uppercase tracking-wide">
            Bookings for {formatFriendlyDate(selectedDate)}
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span
              className={`font-display font-black text-3xl ${
                isSelectedFull ? 'text-flame-400' : 'text-volt-400'
              }`}
            >
              {selectedBookedCount}
            </span>
            <span className="text-xs text-ink-400 font-bold">/ {DAILY_CAPACITY} Bookings</span>
          </div>
          <p className="text-[11px] text-ink-400">{totalGuestsOnSelectedDate} total people visiting</p>
        </div>

        {/* Remaining Slots */}
        <div className="rounded-2xl bg-ink-900 border border-ink-800 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-ink-400 uppercase tracking-wide">
            Remaining Slots
          </span>
          <div className="my-2">
            <span
              className={`font-display font-black text-3xl ${
                selectedRemaining === 0 ? 'text-flame-400' : 'text-emerald-400'
              }`}
            >
              {selectedRemaining}
            </span>
            <span className="text-xs text-ink-400 ml-1.5">Slots Left</span>
          </div>
          <p className="text-[11px] text-ink-400">Available for customer booking</p>
        </div>

        {/* Capacity Status */}
        <div
          className={`rounded-2xl p-5 shadow-sm border flex flex-col justify-between ${
            isSelectedFull
              ? 'bg-flame-500/10 border-flame-500/40 text-flame-400'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wide">
            Status for Selected Date
          </span>
          <div className="my-2 flex items-center gap-2">
            <span className="text-2xl">{isSelectedFull ? '🔴' : '🟢'}</span>
            <span className="font-display font-black text-2xl">
              {isSelectedFull ? 'FULLY BOOKED' : 'SLOTS AVAILABLE'}
            </span>
          </div>
          <div className="w-full bg-ink-950/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isSelectedFull ? 'bg-flame-500' : 'bg-volt-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bookings Table for Selected Date */}
      <div className="bg-ink-900 border border-ink-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-ink-800 pb-4">
          <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-volt-400" />
            <span>Customer Bookings on {formatFriendlyDate(selectedDate)}</span>
            <span className="text-xs text-ink-400 font-mono">({selectedBookedCount} Bookings)</span>
          </h3>
        </div>

        {selectedDateBookings.length === 0 ? (
          <div className="p-8 text-center text-ink-400 text-sm">
            No bookings scheduled for this date yet. All 50 slots are available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-950/80 text-ink-400 uppercase tracking-wider font-bold border-b border-ink-800">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Time Slot</th>
                  <th className="px-4 py-3">Package / Guests</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {selectedDateBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-ink-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-volt-400">{b.booking_id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{b.full_name}</td>
                    <td className="px-4 py-3 text-ink-300">{b.mobile_number}</td>
                    <td className="px-4 py-3 text-ink-200">{b.preferred_time}</td>
                    <td className="px-4 py-3 text-ink-300">
                      {b.category} ({b.quantity || 1} Guests)
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          b.payment_status === 'Successful'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {b.booking_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSelectBooking(b)}
                        className="p-1.5 rounded-lg bg-ink-950 hover:bg-ink-800 text-ink-300 hover:text-white border border-ink-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Date-wise Capacity Forecast Table */}
      <div className="bg-ink-900 border border-ink-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-volt-400" />
              <span>Upcoming Date-Wise Capacity Forecast</span>
            </h3>
            <p className="text-xs text-ink-400 mt-0.5">
              Live date-by-date booking numbers and remaining capacity limits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setForecastDays(14)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                forecastDays === 14
                  ? 'bg-volt-500 text-ink-950 font-black'
                  : 'bg-ink-950 text-ink-400 hover:text-white border border-ink-800'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setForecastDays(30)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                forecastDays === 30
                  ? 'bg-volt-500 text-ink-950 font-black'
                  : 'bg-ink-950 text-ink-400 hover:text-white border border-ink-800'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ink-950/80 text-ink-400 uppercase tracking-wider font-bold border-b border-ink-800">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Daily Limit</th>
                <th className="px-5 py-3">Booked Slots</th>
                <th className="px-5 py-3">Occupancy Bar</th>
                <th className="px-5 py-3">Remaining</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {capacitySummary.map((item) => {
                const percent = Math.min(100, Math.round((item.booked / item.capacity) * 100));
                const isItemToday = item.date === todayStr;
                return (
                  <tr
                    key={item.date}
                    className={`hover:bg-ink-800/30 transition-colors ${
                      item.date === selectedDate ? 'bg-volt-500/5' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-white">
                      <span>{formatFriendlyDate(item.date)}</span>
                      {isItemToday && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-volt-500/10 text-volt-400 border border-volt-500/30 font-bold">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-ink-300">{item.capacity}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`font-bold font-mono ${item.isFull ? 'text-flame-400' : 'text-white'}`}>
                        {item.booked}
                      </span>
                      <span className="text-ink-500 ml-1">bookings</span>
                    </td>
                    <td className="px-5 py-3.5 min-w-[140px]">
                      <div className="w-full bg-ink-950 rounded-full h-2 overflow-hidden border border-ink-800">
                        <div
                          className={`h-full ${item.isFull ? 'bg-flame-500' : 'bg-volt-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`font-bold font-mono ${
                          item.remaining === 0 ? 'text-flame-400' : 'text-emerald-400'
                        }`}
                      >
                        {item.remaining}
                      </span>
                      <span className="text-ink-500 ml-1">slots left</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          item.isFull
                            ? 'bg-flame-500/10 text-flame-400 border-flame-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <span>{item.isFull ? '🔴' : '🟢'}</span>
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDate(item.date)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-volt-400 hover:text-volt-300 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
