import { useState, type FormEvent } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Authorized admin credentials
      const isValid =
        (cleanEmail === 'admin@unlimitedfun.in' || cleanEmail === 'admin' || cleanEmail === 'balachandraya.group@gmail.com') &&
        (cleanPass === 'admin@unlimitedfun2026' || cleanPass === 'admin123' || cleanPass === '9059058449');

      if (isValid) {
        const token = {
          user: cleanEmail,
          authenticated: true,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        sessionStorage.setItem('unlimited_fun_admin_auth', JSON.stringify(token));
        onLoginSuccess();
      } else {
        setError('Invalid admin credentials. Access denied.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-volt-500/10 border border-volt-500/30 text-volt-400 mb-4 shadow-lg shadow-volt-500/10">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            ADMIN <span className="text-volt-500">PORTAL</span>
          </h1>
          <p className="text-ink-400 text-xs sm:text-sm mt-1">
            Unlimited Fun Trampoline Park Management
          </p>
        </div>

        <div className="rounded-3xl bg-ink-900 border border-ink-800 p-8 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-xl bg-flame-500/10 border border-flame-500/30 p-3.5 flex items-center gap-2.5 text-flame-400 text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-2">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unlimitedfun.in"
                  className="w-full rounded-xl bg-ink-950 border border-ink-700 pl-10 pr-4 py-3 text-white placeholder-ink-600 focus:border-volt-500 focus:outline-none focus:ring-1 focus:ring-volt-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-ink-950 border border-ink-700 pl-10 pr-4 py-3 text-white placeholder-ink-600 focus:border-volt-500 focus:outline-none focus:ring-1 focus:ring-volt-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-3.5 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-lg shadow-volt-500/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                'SIGN IN TO DASHBOARD'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-800/80 text-center">
            <a
              href="/"
              className="text-xs text-ink-400 hover:text-white transition-colors"
            >
              ← Back to Customer Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
