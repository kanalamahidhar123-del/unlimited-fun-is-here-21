import {
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  Hash,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import type { BookingRecord } from '@/lib/bookingStore';

interface ModalProps {
  booking: BookingRecord;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BookingDetailsModal({
  booking,
  onClose,
  onConfirm,
  onReject,
  onDelete,
}: ModalProps) {
  const isRegistration = booking.payment_method === 'Registration Only' || booking.payment_status === 'Not Required';
  const isUnderpaid = !isRegistration && booking.paid_amount < booking.booking_amount;
  const difference = booking.booking_amount - booking.paid_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-ink-900 border border-ink-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-800 bg-ink-950/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-black text-volt-400 bg-volt-500/10 px-3 py-1 rounded-lg border border-volt-500/30">
              {booking.booking_id}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-ink-800 text-ink-300">
              {booking.type} Booking
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-ink-800 text-ink-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Bar */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-ink-950/80 border border-ink-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
                Payment Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  booking.payment_status === 'Successful'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : booking.payment_status === 'Not Required'
                    ? 'bg-ink-800 text-ink-300 border border-ink-700'
                    : booking.payment_status === 'Failed'
                    ? 'bg-flame-500/10 text-flame-400 border border-flame-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {booking.payment_status === 'Successful' && '🟢 Successful'}
                {booking.payment_status === 'Not Required' && '⚪ Not Required'}
                {booking.payment_status === 'Failed' && '🔴 Failed'}
                {booking.payment_status === 'Pending Verification' && '🟡 Pending Verification'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
                Booking Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  booking.booking_status === 'Confirmed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : booking.booking_status === 'Registration Received'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : booking.booking_status === 'Cancelled'
                    ? 'bg-flame-500/10 text-flame-400 border border-flame-500/30'
                    : 'bg-ink-800 text-ink-300 border border-ink-700'
                }`}
              >
                {booking.booking_status}
              </span>
            </div>
          </div>

          {/* Underpayment / Difference Alert */}
          {isUnderpaid && (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-amber-300">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-400">Underpayment Notice</p>
                <p>
                  Customer paid <strong>₹{booking.paid_amount.toLocaleString('en-IN')}</strong>, but the expected booking total is <strong>₹{booking.booking_amount.toLocaleString('en-IN')}</strong> (Short by ₹{difference.toLocaleString('en-IN')}).
                </p>
              </div>
            </div>
          )}

          {/* Customer & Booking Details */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-volt-400">
                Customer Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-ink-200">
                  <User className="h-4 w-4 text-ink-500" />
                  <span className="font-semibold">{booking.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-200">
                  <Phone className="h-4 w-4 text-ink-500" />
                  <a href={`tel:${booking.mobile_number}`} className="hover:text-volt-400">
                    {booking.mobile_number}
                  </a>
                </div>
                {booking.email && (
                  <div className="flex items-center gap-2 text-ink-200">
                    <Mail className="h-4 w-4 text-ink-500" />
                    <span>{booking.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-volt-400">
                Slot & Schedule
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-ink-200">
                  <Calendar className="h-4 w-4 text-ink-500" />
                  <span>{booking.visit_date}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-200">
                  <Clock className="h-4 w-4 text-ink-500" />
                  <span>{booking.preferred_time}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-200">
                  <Sparkles className="h-4 w-4 text-ink-500" />
                  <span>
                    {booking.category} {booking.duration !== 'N/A' && `(${booking.duration})`} · {booking.quantity} {booking.type === 'RFID' ? 'Cards' : 'Guests'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown Comparison Section */}
          <div className="rounded-2xl bg-ink-950/80 border border-ink-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-volt-400">
                Payment & Gateway Verification
              </h4>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                booking.payment_method === 'Razorpay' || booking.razorpay_payment_id
                  ? 'bg-volt-500/10 text-volt-400 border-volt-500/30'
                  : 'bg-ink-800 text-ink-300 border-ink-700'
              }`}>
                {booking.payment_method === 'Razorpay' || booking.razorpay_payment_id ? '⚡ Razorpay Online' : '📱 Manual UPI'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-ink-900 border border-ink-800">
                <span className="text-[11px] text-ink-400 block uppercase font-bold">Booking Amount</span>
                <span className="font-display font-black text-xl text-white mt-1 block">
                  ₹{booking.booking_amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-ink-500">Calculated package price</span>
              </div>

              <div className={`p-3 rounded-xl border ${isUnderpaid ? 'bg-amber-950/20 border-amber-500/40' : 'bg-ink-900 border-volt-500/40'}`}>
                <span className="text-[11px] text-volt-400 block uppercase font-bold">Actual Paid Amount</span>
                <span className="font-display font-black text-xl text-volt-400 mt-1 block">
                  ₹{booking.paid_amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-ink-400">Verified paid amount</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-ink-900 border border-ink-800">
                <span className="text-[11px] text-ink-400 block uppercase font-bold">Transaction / UTR</span>
                <span className="font-mono font-bold text-xs text-white break-all mt-1 block bg-ink-950 p-1.5 rounded border border-ink-800">
                  {booking.razorpay_payment_id || booking.utr || 'N/A'}
                </span>
              </div>
            </div>

            {(booking.razorpay_order_id || booking.razorpay_payment_id) && (
              <div className="rounded-xl bg-ink-900/90 border border-volt-500/20 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-400">Razorpay Order ID:</span>
                  <span className="font-mono text-white font-bold">{booking.razorpay_order_id || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-400">Razorpay Payment ID:</span>
                  <span className="font-mono text-volt-400 font-bold">{booking.razorpay_payment_id || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-400">HMAC Signature Status:</span>
                  <span className="font-semibold text-emerald-400">✅ Server Verified</span>
                </div>
                {booking.payment_verified_at && (
                  <div className="flex items-center justify-between text-[11px] text-ink-500">
                    <span>Verified At:</span>
                    <span>{new Date(booking.payment_verified_at).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Special Request */}
          {booking.special_request && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-400 block mb-1">
                Special Request / Note
              </span>
              <p className="text-sm text-ink-300 bg-ink-950/60 p-3 rounded-xl border border-ink-800">
                {booking.special_request}
              </p>
            </div>
          )}

          <div className="text-[11px] text-ink-500 font-mono">
            Booking created: {new Date(booking.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-ink-800 bg-ink-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-ink-800 text-ink-300 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the booking for "${booking.full_name}" (${booking.booking_id})?`)) {
                  onDelete(booking.id);
                  onClose();
                }
              }}
              title="Delete this booking permanently"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-flame-500/10 hover:bg-flame-500/20 text-flame-400 border border-flame-500/30 text-xs font-bold transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Record</span>
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              onClick={() => {
                onReject(booking.id);
                onClose();
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-flame-500/10 border border-flame-500/40 text-flame-400 hover:bg-flame-500 hover:text-white text-xs font-bold transition-all active:scale-95"
            >
              <XCircle className="h-4 w-4" /> REJECT
            </button>
            <button
              onClick={() => {
                onConfirm(booking.id);
                onClose();
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-emerald-500 text-ink-950 hover:bg-emerald-400 text-xs font-black transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4" /> CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
