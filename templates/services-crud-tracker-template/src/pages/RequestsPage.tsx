import { useCallback, useEffect, useMemo, useState } from 'react';

import { HorizontalBarChart } from '@/components/HorizontalBarChart';
import { RequestFormModal } from '@/components/RequestFormModal';
import { useAuth } from '@/hooks/AuthContext';
import { isLocalBackend } from '@/services/rayfinClient';
import {
  createRequest,
  deleteRequest,
  type Request,
  type RequestDraft,
  updateRequest,
} from '@/services/requests';
import { ensureSeeded, getRequests } from '@/services/seed';
import { computeKpis, countByTeam, estimateByStatus } from '@/services/stats';

const card = 'border border-gray-200 bg-white shadow-sm';

const priorityStyle: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-gray-50 text-gray-600 border-gray-200',
};

const statusStyle: Record<string, string> = {
  Open: 'bg-blue-50 text-brand-blue border-blue-200',
  'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function Pill({ label, styles }: { label: string; styles: string }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {label}
    </span>
  );
}

export function RequestsPage() {
  const { signOut, user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal state: `undefined` = closed, `null` = create, Request = edit.
  const [editing, setEditing] = useState<Request | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await ensureSeeded();
      setRequests(await getRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const kpis = useMemo(() => computeKpis(requests), [requests]);
  const byTeam = useMemo(() => countByTeam(requests), [requests]);
  const byStatus = useMemo(() => estimateByStatus(requests), [requests]);

  const handleSubmit = useCallback(
    async (draft: RequestDraft) => {
      if (editing) {
        await updateRequest(editing.id, draft);
      } else {
        await createRequest(draft);
      }
      setEditing(undefined);
      await refresh();
    },
    [editing, refresh]
  );

  const handleDelete = useCallback(
    async (request: Request) => {
      if (!window.confirm(`Delete "${request.title}"?`)) return;
      setBusyId(request.id);
      setError(null);
      try {
        await deleteRequest(request.id);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete.');
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  return (
    <div className="min-h-screen bg-white text-brand-ink">
      <header className="sticky top-0 z-20 bg-brand-deep">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <ContosoMark />
            <div className="leading-tight">
              <span className="block font-display text-lg font-bold uppercase tracking-wide text-white">
                Contoso
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.28em] text-brand-clarity">
                Services Request Tracker
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.email && (
              <span
                className="hidden text-sm text-white/60 sm:inline"
                title={user.email}
              >
                {user.email}
              </span>
            )}
            <button
              onClick={() => void signOut()}
              className="contoso-btn border border-white/30 px-4 py-1.5 text-xs text-white hover:border-white hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-brand-blue" />
      </header>

      <main>
        {/* Hero */}
        <section className="contoso-hero relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
            <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-brand-clarity">
              Live SQL backend
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Track the work, write it back
            </h1>
            <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-white/75 sm:text-lg">
              Create, edit, and delete service requests — every change is
              persisted to a Rayfin MSSQL backend and reflected in the KPIs the
              moment you save.
            </p>
          </div>
          <div className="h-1 w-full bg-brand-blue" />
        </section>

        {isLocalBackend() && (
          <div className="mx-auto max-w-6xl px-6">
            <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>Local preview mode.</strong> No SQL backend is configured,
              so changes are kept in memory for this session. Run{' '}
              <code className="font-mono">rayfin up</code> to persist to a real
              MSSQL database.
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-6xl px-6">
            <div className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* KPI band */}
        <section className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 py-16 sm:grid-cols-4 sm:divide-x sm:divide-gray-200">
          <BigStat label="Total requests" value={kpis.total.toLocaleString()} />
          <BigStat label="Open" value={kpis.open.toLocaleString()} />
          <BigStat
            label="In progress"
            value={kpis.inProgress.toLocaleString()}
          />
          <BigStat
            label="Est. hours"
            value={kpis.totalEstimateHours.toLocaleString()}
          />
        </section>

        {/* Analytics band */}
        {!loading && requests.length > 0 && (
          <section className="bg-brand-deep py-16">
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-clarity">
                Analytics
              </p>
              <h2 className="mt-3 text-3xl font-normal tracking-tight text-white sm:text-4xl">
                Workload mix
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/70">
                How requests and estimated effort are distributed across teams
                and workflow states.
              </p>

              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <HorizontalBarChart
                  data={byTeam}
                  color="#0085ca"
                  format={(n) => n.toLocaleString()}
                  title="Requests by team"
                  ariaLabel="Number of requests by team"
                />
                <HorizontalBarChart
                  data={byStatus}
                  color="#00244a"
                  format={(n) => `${n.toLocaleString()} h`}
                  title="Estimate hours by status"
                  ariaLabel="Estimated hours by workflow status"
                />
              </div>
            </div>
          </section>
        )}

        {/* Records table */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
                Records
              </p>
              <h2 className="mt-2 text-3xl font-normal tracking-tight text-brand-deep sm:text-4xl">
                Service requests
              </h2>
            </div>
            <button
              onClick={() => setEditing(null)}
              className="contoso-btn bg-brand-blue px-5 py-2 text-xs text-white hover:bg-brand-blue-dark"
            >
              + New request
            </button>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-gray-400">Loading…</p>
          ) : requests.length === 0 ? (
            <div className={`px-6 py-16 text-center ${card}`}>
              <p className="text-sm text-gray-500">
                No requests yet. Create your first one to get started.
              </p>
            </div>
          ) : (
            <div className={`overflow-hidden ${card}`}>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Team</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Est. (h)</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.team}</td>
                      <td className="px-4 py-3 text-gray-600">{r.owner}</td>
                      <td className="px-4 py-3">
                        <Pill
                          label={r.priority}
                          styles={priorityStyle[r.priority] ?? ''}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Pill
                          label={r.status}
                          styles={statusStyle[r.status] ?? ''}
                        />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                        {r.estimateHours.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-500">
                        {r.createdOn}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditing(r)}
                            className="border border-gray-300 px-2.5 py-1 text-xs font-medium text-brand-deep hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDelete(r)}
                            disabled={busyId === r.id}
                            className="border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {busyId === r.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {editing !== undefined && (
        <RequestFormModal
          request={editing}
          onSubmit={handleSubmit}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}

function ContosoMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center bg-white">
      <span className="font-display text-sm font-bold leading-none tracking-tight text-brand-deep">
        C
      </span>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 text-center sm:px-6">
      <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-brand-blue sm:text-5xl">
        {value}
      </p>
      <p className="mt-3 font-display text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
        {label}
      </p>
    </div>
  );
}
