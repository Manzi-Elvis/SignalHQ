import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { incidentsApi } from '../api/incidents';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import type { Incident, IncidentEvent, User } from '../types';
import { IncidentSeverity, IncidentStatus, IncidentEventType, Role } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useIncidentSocket } from '../hooks/useIncidentSocket';

const NEXT_STATES: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.OPEN]: [IncidentStatus.INVESTIGATING],
  [IncidentStatus.INVESTIGATING]: [IncidentStatus.IDENTIFIED, IncidentStatus.OPEN],
  [IncidentStatus.IDENTIFIED]: [IncidentStatus.MONITORING, IncidentStatus.INVESTIGATING],
  [IncidentStatus.MONITORING]: [IncidentStatus.RESOLVED, IncidentStatus.IDENTIFIED],
  [IncidentStatus.RESOLVED]: [IncidentStatus.POSTMORTEM, IncidentStatus.MONITORING],
  [IncidentStatus.POSTMORTEM]: [],
};

const EVENT_VERBS: Partial<Record<IncidentEventType, string>> = {
  [IncidentEventType.CREATED]: 'reported the incident',
  [IncidentEventType.COMMENT]: 'commented',
};

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<IncidentEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canManage = user?.role === Role.ON_CALL_ENGINEER || user?.role === Role.ADMIN;
  const isOwnerOrAdmin =
    !!incident && (incident.owner?.id === user?.id || user?.role === Role.ADMIN);

  const loadAll = async (incidentId: string) => {
    const [inc, tl, allUsers] = await Promise.all([
      incidentsApi.getOne(incidentId),
      incidentsApi.getTimeline(incidentId),
      usersApi.list(),
    ]);
    setIncident(inc);
    setTimeline(tl);
    setUsers(allUsers);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadAll(id).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useIncidentSocket({
    incidentId: id ?? null,
    token,
    onIncidentUpdated: (updated) => setIncident(updated),
    onNewEvent: (event) => setTimeline((prev) => [...prev, event]),
  });

  if (loading || !incident) {
    return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-500">Loading…</div>;
  }

  const handleStatusChange = async (status: IncidentStatus) => {
    setError(null);
    try {
      const updated = await incidentsApi.updateStatus(incident.id, status);
      setIncident(updated);
      const tl = await incidentsApi.getTimeline(incident.id);
      setTimeline(tl);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update status');
    }
  };

  const handleSeverityChange = async (severity: IncidentSeverity) => {
    setError(null);
    try {
      const updated = await incidentsApi.updateSeverity(incident.id, severity);
      setIncident(updated);
      const tl = await incidentsApi.getTimeline(incident.id);
      setTimeline(tl);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update severity');
    }
  };

  const handleAssign = async (ownerId: string) => {
    setError(null);
    try {
      const updated = await incidentsApi.assignOwner(incident.id, ownerId);
      setIncident(updated);
      const tl = await incidentsApi.getTimeline(incident.id);
      setTimeline(tl);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to assign owner');
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await incidentsApi.addComment(incident.id, comment);
      setComment('');
      const tl = await incidentsApi.getTimeline(incident.id);
      setTimeline(tl);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to add comment');
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await incidentsApi.uploadAttachment(incident.id, file);
      const tl = await incidentsApi.getTimeline(incident.id);
      setTimeline(tl);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Upload failed');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{incident.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-slate-700">{incident.description}</p>
        <p className="mt-2 text-sm text-slate-500">
          Reported by {incident.reporter.name} on {new Date(incident.createdAt).toLocaleString()}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-500">Status</h3>
          {canManage && NEXT_STATES[incident.status].length > 0 ? (
            <select
              value=""
              onChange={(e) => e.target.value && handleStatusChange(e.target.value as IncidentStatus)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Move to…</option>
              {NEXT_STATES[incident.status].map((s) => {
                const requiresOwnership = s === IncidentStatus.RESOLVED;
                const disabled = requiresOwnership && !isOwnerOrAdmin;
                return (
                  <option key={s} value={s} disabled={disabled}>
                    {s} {disabled ? '(owner/admin only)' : ''}
                  </option>
                );
              })}
            </select>
          ) : (
            <p className="text-sm text-slate-400">
              {incident.status === IncidentStatus.POSTMORTEM
                ? 'Terminal state'
                : 'Only on-call engineers can change status'}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-500">Severity</h3>
          {canManage ? (
            <select
              value={incident.severity}
              onChange={(e) => handleSeverityChange(e.target.value as IncidentSeverity)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {Object.values(IncidentSeverity).map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-slate-400">On-call engineers only</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-500">Owner</h3>
          {canManage ? (
            <select
              value={incident.owner?.id ?? ''}
              onChange={(e) => e.target.value && handleAssign(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="" disabled>
                Assign owner…
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-slate-700">{incident.owner?.name ?? 'Unassigned'}</p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-slate-500">Upload evidence</h3>
        <input
          type="file"
          onChange={handleUpload}
          className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />
        <p className="mt-2 text-xs text-slate-400">
          Uploaded files appear in the timeline below.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-slate-500">Timeline</h3>
        <ul className="space-y-3">
          {timeline.map((event) => (
            <li key={event.id} className="border-l-2 border-slate-200 pl-3 text-sm">
              <p className="text-slate-800">
                <span className="font-medium">{event.author.name}</span>{' '}
                {EVENT_VERBS[event.type] ?? <span className="text-slate-600">{event.content}</span>}
              </p>
              {event.type === IncidentEventType.COMMENT && (
                <p className="text-slate-600">{event.content}</p>
              )}
              <p className="text-xs text-slate-400">{new Date(event.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleComment} className="mt-4 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment to the timeline…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}