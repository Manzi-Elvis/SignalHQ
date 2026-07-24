import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            SignalHQ
          </Link>
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            Incidents
          </Link>
          {user?.role === Role.ADMIN && (
            <Link to="/audit-logs" className="text-sm text-slate-600 hover:text-slate-900">
              Audit Logs
            </Link>
          )}
          {user?.role === Role.ADMIN && (
            <Link to="/admin/users" className="text-sm text-slate-600 hover:text-slate-900">
              Manage Users
            </Link>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {user.name} · <span className="font-medium">{user.role}</span>
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}