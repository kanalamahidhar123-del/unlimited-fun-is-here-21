import { useState, useEffect } from 'react';
import {
  Cake,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Users,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getBirthdayEnquiries,
  fetchBirthdayEnquiriesFromServer,
  updateBirthdayStatus,
  deleteBirthdayEnquiry,
  createBirthdayEnquiry,
  type BirthdayEnquiry,
} from '@/lib/birthdayStore';

interface AdminBirthdayEnquiriesProps {
  onNotify?: (msg: string) => void;
}

export default function AdminBirthdayEnquiries({ onNotify }: AdminBirthdayEnquiriesProps) {
  const [enquiries, setEnquiries] = useState<BirthdayEnquiry[]>(getBirthdayEnquiries());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New enquiry form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferred_date: '',
    number_of_guests: '',
    package_name: 'Birthday Party Package',
    message: '',
  });

  const loadData = async () => {
    setLoading(true);
    setEnquiries(getBirthdayEnquiries());
    try {
      const serverList = await fetchBirthdayEnquiriesFromServer();
      setEnquiries(serverList);
    } catch (e) {
      console.warn('Could not refresh birthday enquiries from server:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      setEnquiries(getBirthdayEnquiries());
    };
    window.addEventListener('unlimited_fun_birthday_enquiries_updated', handleUpdate);
    return () => {
      window.removeEventListener('unlimited_fun_birthday_enquiries_updated', handleUpdate);
    };
  }, []);

  const handleStatusChange = (id: string, newStatus: BirthdayEnquiry['status']) => {
    updateBirthdayStatus(id, newStatus);
    setEnquiries(getBirthdayEnquiries());
    if (onNotify) onNotify(`Status updated to: ${newStatus}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete birthday enquiry for "${name}"?`)) return;
    deleteBirthdayEnquiry(id);
    setEnquiries(getBirthdayEnquiries());
    if (onNotify) onNotify('Birthday enquiry deleted.');
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please enter Name and Phone number.');
      return;
    }

    await createBirthdayEnquiry({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      preferred_date: formData.preferred_date,
      number_of_guests: Number(formData.number_of_guests) || 0,
      package_name: formData.package_name,
      message: formData.message.trim(),
      status: 'New',
    });

    setFormData({
      name: '',
      phone: '',
      email: '',
      preferred_date: '',
      number_of_guests: '',
      package_name: 'Birthday Party Package',
      message: '',
    });
    setShowAddModal(false);
    loadData();
    if (onNotify) onNotify('Birthday enquiry added successfully!');
  };

  // Filter enquiries
  const filtered = enquiries.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchDate = item.preferred_date.toLowerCase().includes(q);
      const matchPackage = item.package_name.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchDate && !matchPackage && !matchMsg) {
        return false;
      }
    }
    return true;
  });

  const countNew = enquiries.filter((e) => e.status === 'New').length;
  const countContacted = enquiries.filter((e) => e.status === 'Contacted').length;
  const countConfirmed = enquiries.filter((e) => e.status === 'Confirmed').length;

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-ink-900 border border-ink-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Enquiries</span>
            <Cake className="h-5 w-5 text-volt-400" />
          </div>
          <div className="my-2">
            <span className="font-display font-black text-3xl text-white">{enquiries.length}</span>
          </div>
          <p className="text-[11px] text-ink-500">Across all customer submissions</p>
        </div>

        <div className="rounded-2xl bg-ink-900 border border-amber-500/20 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">New Enquiries</span>
            <Clock className="h-5 w-5" />
          </div>
          <div className="my-2">
            <span className="font-display font-black text-3xl text-amber-400">{countNew}</span>
          </div>
          <p className="text-[11px] text-amber-500/80">Pending staff call / response</p>
        </div>

        <div className="rounded-2xl bg-ink-900 border border-cyan-500/20 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold uppercase tracking-wider">Contacted</span>
            <Phone className="h-5 w-5" />
          </div>
          <div className="my-2">
            <span className="font-display font-black text-3xl text-cyan-400">{countContacted}</span>
          </div>
          <p className="text-[11px] text-cyan-500/80">Discussion in progress</p>
        </div>

        <div className="rounded-2xl bg-ink-900 border border-emerald-500/20 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="my-2">
            <span className="font-display font-black text-3xl text-emerald-400">{countConfirmed}</span>
          </div>
          <p className="text-[11px] text-emerald-500/80">Slot booked & confirmed</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="rounded-2xl bg-ink-900 border border-ink-800 p-4 sm:p-5 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, date, package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-volt-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-ink-950 border border-ink-800 text-sm text-ink-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-volt-500"
          >
            <option value="ALL">All Statuses ({enquiries.length})</option>
            <option value="New">New ({countNew})</option>
            <option value="Contacted">Contacted ({countContacted})</option>
            <option value="Confirmed">Confirmed ({countConfirmed})</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-200 text-sm font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-volt-500 hover:bg-volt-400 text-ink-950 text-sm font-bold transition-all shadow-lg shadow-volt-500/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="rounded-2xl bg-ink-900 border border-ink-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-800 bg-ink-950/50 text-[11px] font-bold text-ink-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Customer & Contact</th>
                <th className="px-5 py-3.5">Event Date & Guests</th>
                <th className="px-5 py-3.5">Package & Message</th>
                <th className="px-5 py-3.5">Submitted On</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/60 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-400">
                    <Cake className="h-10 w-10 mx-auto text-ink-600 mb-3" />
                    <p className="font-semibold text-ink-300">No birthday party enquiries found</p>
                    <p className="text-xs text-ink-500 mt-1">
                      {search || statusFilter !== 'ALL'
                        ? 'Try clearing the search query or status filter.'
                        : 'Enquiries submitted by customers from the website will appear here in real time.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const whatsappMsg = encodeURIComponent(
                    `Hi ${item.name}! Thank you for enquiring about a Birthday Party at Unlimited Fun Bhimavaram. We'd love to help organize your celebration!`
                  );

                  return (
                    <tr key={item.id || `bday-row-${idx}`} className="hover:bg-ink-800/40 transition-colors">
                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-base">{item.name}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1 text-xs text-volt-400 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{item.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${item.phone.replace(/\D/g, '')}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-1 text-xs text-ink-400 mt-1">
                            <Mail className="h-3 w-3" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Event Date & Guests */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Calendar className="h-4 w-4 text-volt-400" />
                          <span>{item.preferred_date || 'Flexible / Not set'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-400 mt-1">
                          <Users className="h-3.5 w-3.5 text-ink-500" />
                          <span>{item.number_of_guests ? `${item.number_of_guests} Guests` : 'Guests not specified'}</span>
                        </div>
                      </td>

                      {/* Package & Message */}
                      <td className="px-5 py-4 max-w-xs">
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-volt-500/10 text-volt-300 border border-volt-500/20 mb-1">
                          {item.package_name || 'Birthday Party'}
                        </span>
                        {item.message ? (
                          <p className="text-xs text-ink-300 line-clamp-2 mt-0.5">{item.message}</p>
                        ) : (
                          <p className="text-xs text-ink-500 italic">No additional message</p>
                        )}
                      </td>

                      {/* Submitted On */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-ink-400">
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div className="text-[10px] text-ink-500">
                          {new Date(item.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as BirthdayEnquiry['status'])}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                            item.status === 'New'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : item.status === 'Contacted'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : item.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-flame-500/10 text-flame-400 border-flame-500/30'
                          }`}
                        >
                          <option value="New" className="bg-ink-900 text-white">🟡 New</option>
                          <option value="Contacted" className="bg-ink-900 text-white">🔵 Contacted</option>
                          <option value="Confirmed" className="bg-ink-900 text-white">🟢 Confirmed</option>
                          <option value="Cancelled" className="bg-ink-900 text-white">🔴 Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete enquiry"
                          className="p-2 rounded-lg bg-ink-800 hover:bg-flame-500/20 text-ink-400 hover:text-flame-400 border border-ink-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Enquiry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-ink-900 border border-ink-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ink-800 pb-4">
              <div className="flex items-center gap-2">
                <Cake className="h-6 w-6 text-volt-500" />
                <h3 className="text-lg font-bold text-white">Add Birthday Party Enquiry</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-ink-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-sm text-white focus:outline-none focus:border-volt-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-sm text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-sm text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-300 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-sm text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-300 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.number_of_guests}
                    onChange={(e) => setFormData({ ...formData, number_of_guests: e.target.value })}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-sm text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-300 mb-1">Notes / Message</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Special requests, timing, cake arrangement, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-sm text-white focus:outline-none focus:border-volt-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-volt-500 hover:bg-volt-400 text-ink-950 text-sm font-bold transition-all shadow-lg shadow-volt-500/20"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
