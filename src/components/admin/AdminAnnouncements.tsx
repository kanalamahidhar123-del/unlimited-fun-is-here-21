import { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Calendar,
  X,
  Search,
} from 'lucide-react';
import {
  getAnnouncements,
  fetchAnnouncementsFromServer,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getCategoryBadge,
  type Announcement,
  type AnnouncementCategory,
} from '@/lib/announcementStore';

const CATEGORIES: AnnouncementCategory[] = [
  'General',
  'Offers',
  'Events',
  'Holiday',
  'Timing',
  'Notice',
];

interface AdminAnnouncementsProps {
  onNotify: (message: string) => void;
}

export default function AdminAnnouncements({ onNotify }: AdminAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('General');
  const [isImportant, setIsImportant] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setAnnouncements(getAnnouncements());
    try {
      const serverList = await fetchAnnouncementsFromServer();
      setAnnouncements(serverList);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('unlimited_fun_announcements_updated', handleUpdate);
    return () => {
      window.removeEventListener('unlimited_fun_announcements_updated', handleUpdate);
    };
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setIsImportant(false);
    setIsPublished(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setIsImportant(item.is_important);
    setIsPublished(item.is_published !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!description.trim()) {
      setFormError('Description / message is required');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingItem) {
        await updateAnnouncement(editingItem.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          is_important: isImportant,
          is_published: isPublished,
        });
        onNotify('Announcement updated successfully!');
      } else {
        await createAnnouncement({
          title: title.trim(),
          description: description.trim(),
          category,
          is_important: isImportant,
          is_published: isPublished,
        });
        onNotify('New announcement published successfully!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save announcement. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemTitle}"?`)) {
      await deleteAnnouncement(id);
      loadData();
      onNotify('Announcement deleted.');
    }
  };

  const handleTogglePublish = async (item: Announcement) => {
    const nextVal = !item.is_published;
    await updateAnnouncement(item.id, { is_published: nextVal });
    loadData();
    onNotify(nextVal ? 'Announcement published to website.' : 'Announcement unpublished (moved to draft).');
  };

  const handleToggleImportant = async (item: Announcement) => {
    const nextVal = !item.is_important;
    await updateAnnouncement(item.id, { is_important: nextVal });
    loadData();
    onNotify(nextVal ? 'Marked as Important!' : 'Removed Important flag.');
  };

  const filtered = announcements.filter((a) => {
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-900 border border-ink-800 rounded-3xl p-6 sm:p-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt-500/10 border border-volt-500/30 text-volt-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Megaphone className="h-3.5 w-3.5" />
            <span>Website Announcements</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            📢 MANAGE <span className="text-volt-500">LATEST INFO</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-400 mt-1 max-w-2xl">
            Publish real-time news, holiday alerts, festive discounts, and park notices. Changes automatically sync to the customer website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-volt-500 hover:bg-volt-400 px-6 py-3.5 text-sm font-black text-ink-950 transition-all shadow-lg shadow-volt-500/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>NEW ANNOUNCEMENT</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-ink-900 border border-ink-800 rounded-2xl p-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-volt-500 text-ink-950 shadow-sm'
                : 'bg-ink-950 border border-ink-800 text-ink-300 hover:text-white'
            }`}
          >
            All ({announcements.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = announcements.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-volt-500 text-ink-950 shadow-sm'
                    : 'bg-ink-950 border border-ink-800 text-ink-300 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-ink-950 border border-ink-800 text-xs text-white placeholder-ink-500 focus:outline-none focus:border-volt-500"
          />
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-ink-900 border border-ink-800 text-ink-400">
          <Megaphone className="h-12 w-12 mx-auto text-ink-600 mb-3" />
          <p className="font-bold text-white text-base">No announcements found</p>
          <p className="text-xs mt-1">Click "New Announcement" to publish information for your visitors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const badge = getCategoryBadge(item.category);
            return (
              <div
                key={item.id}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all bg-ink-900 border ${
                  item.is_important
                    ? 'border-volt-500/50 shadow-lg shadow-volt-500/5'
                    : 'border-ink-800'
                } ${!item.is_published ? 'opacity-60 border-dashed' : ''}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.badgeClass}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Important Toggle */}
                      <button
                        onClick={() => handleToggleImportant(item)}
                        title={item.is_important ? 'Remove Important flag' : 'Mark as Important'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.is_important
                            ? 'bg-volt-500 text-ink-950 border-volt-400 font-bold'
                            : 'bg-ink-950 text-ink-400 border-ink-800 hover:text-white'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>

                      {/* Publish / Draft Toggle */}
                      <button
                        onClick={() => handleTogglePublish(item)}
                        title={item.is_published ? 'Unpublish from website' : 'Publish to website'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {item.is_published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black text-lg text-white mb-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-ink-300 line-clamp-4 whitespace-pre-line mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-ink-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-ink-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-volt-500" />
                    {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Announcement"
                      className="p-1.5 rounded-lg bg-ink-950 hover:bg-ink-800 text-ink-300 hover:text-white border border-ink-800 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete Announcement"
                      className="p-1.5 rounded-lg bg-ink-950 hover:bg-flame-500/20 text-ink-400 hover:text-flame-400 border border-ink-800 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-ink-800 pb-4">
              <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                <span>{editingItem ? '✏️' : '📢'}</span>
                <span>{editingItem ? 'Edit Announcement' : 'Create New Announcement'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-ink-950 text-ink-400 hover:text-white border border-ink-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-flame-500/10 border border-flame-500/30 text-xs text-flame-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5">
                  Announcement Title <span className="text-flame-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Special Weekend Offer / Holiday Schedule"
                  className="w-full rounded-xl bg-ink-950 border border-ink-700 px-4 py-3 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-volt-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                  className="w-full rounded-xl bg-ink-950 border border-ink-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-volt-500"
                >
                  <option value="General">📢 General Info</option>
                  <option value="Offers">🏷️ Special Offer</option>
                  <option value="Events">🎉 Event</option>
                  <option value="Holiday">🏖️ Holiday Notice</option>
                  <option value="Timing">⏰ Timing Update</option>
                  <option value="Notice">⚠️ Important Notice</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5">
                  Detailed Message / Description <span className="text-flame-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the full announcement details, timings, terms, or message for customers..."
                  className="w-full rounded-xl bg-ink-950 border border-ink-700 px-4 py-3 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-volt-500"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-ink-950 border border-ink-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="h-4 w-4 rounded border-ink-700 bg-ink-900 text-volt-500 focus:ring-volt-500"
                  />
                  <span className="text-xs font-bold text-white">✨ Mark as Important</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-ink-950 border border-ink-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-ink-700 bg-ink-900 text-volt-500 focus:ring-volt-500"
                  />
                  <span className="text-xs font-bold text-white">🌐 Publish to Website</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-ink-950 hover:bg-ink-800 text-ink-300 text-xs font-bold border border-ink-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-volt-500 hover:bg-volt-400 text-ink-950 text-xs font-black transition-colors shadow-md shadow-volt-500/20 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
