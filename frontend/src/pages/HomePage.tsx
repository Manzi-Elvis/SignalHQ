import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
      <p className="mt-2 text-slate-600">Role: {user?.role}</p>
      <button
        onClick={logout}
        className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
      >
        Log out
      </button>
    </div>
  );
}