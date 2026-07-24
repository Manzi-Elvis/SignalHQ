import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { IncidentSeverity, IncidentStatus } from '../types';

const LIFECYCLE: IncidentStatus[] = [
  IncidentStatus.OPEN,
  IncidentStatus.INVESTIGATING,
  IncidentStatus.IDENTIFIED,
  IncidentStatus.MONITORING,
  IncidentStatus.RESOLVED,
  IncidentStatus.POSTMORTEM,
];

const FEATURES = [
  {
    title: 'Role-based access',
    description:
      'Viewers report, responders comment, on-call engineers triage, admins govern. Every action is checked against the role that actually did it.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700">
        <path
          d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Real-time timeline',
    description:
      'Status changes, severity shifts, comments, and evidence uploads land in every open tab the instant they happen — no refresh, no polling.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Full audit trail',
    description:
      'Every login, escalation, and ownership change is recorded — separate from the incident timeline, built for security review.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700">
        <path
          d="M9 12l2 2 4-4M5 5h14v14H5z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Search that scales',
    description:
      'Full-text search across every past incident, so the fix your team found six months ago is one query away during the next one.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const SAMPLE_INCIDENTS: { title: string; severity: IncidentSeverity; status: IncidentStatus }[] = [
  { title: 'Checkout API returning 500s', severity: IncidentSeverity.SEV1, status: IncidentStatus.INVESTIGATING },
  { title: 'Slow checkout page load', severity: IncidentSeverity.SEV3, status: IncidentStatus.MONITORING },
  { title: 'Login page returning 404', severity: IncidentSeverity.SEV2, status: IncidentStatus.RESOLVED },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">SignalHQ</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:pb-28 sm:pt-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              SEV1 waits for no one
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Report, triage, and resolve incidents — together.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              SignalHQ gives your team one place to classify severity, own the response, and see
              exactly what happened — from the first report to the postmortem.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Get started free
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Live-preview style card, built from the real badge components */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-medium text-slate-500">Open incidents</span>
                <span className="text-xs text-slate-400">Updated just now</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {SAMPLE_INCIDENTS.map((incident) => (
                  <li key={incident.title} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-slate-800">{incident.title}</span>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-semibold text-slate-900">
            Built for the whole incident, not just the ticket.
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Most tools stop at "create ticket." SignalHQ covers the parts that actually happen
            during an incident — ownership, escalation, evidence, and the record you'll want
            later.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold text-slate-900">One lifecycle, no guessing.</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Every incident moves through the same states, enforced by the backend — not just the
          UI. A status can't skip a step or reopen after the postmortem is written.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {LIFECYCLE.map((status, i) => (
            <div key={status} className="flex items-center gap-3">
              <StatusBadge status={status} />
              {i < LIFECYCLE.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Get your team on the same page during the next incident.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-300">
            Free to start. No credit card, no sales call — just sign up and report your first
            incident.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
          SignalHQ — built with NestJS, PostgreSQL, and React.
        </div>
      </footer>
    </div>
  );
}