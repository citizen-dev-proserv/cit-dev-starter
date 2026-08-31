import { useEffect, useState } from 'react';

import {
  PRIORITIES,
  type Priority,
  STATUSES,
  type Status,
  type Team,
  TEAMS,
} from '@/data/sampleData';
import type { Request, RequestDraft } from '@/services/requests';

const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY: RequestDraft = {
  title: '',
  team: TEAMS[0],
  owner: '',
  priority: 'Medium',
  status: 'Open',
  estimateHours: 8,
  createdOn: todayIso(),
};

function toDraft(request: Request | null): RequestDraft {
  if (!request) return { ...EMPTY, createdOn: todayIso() };
  const { id: _id, ...draft } = request;
  return draft;
}

const field =
  'w-full border border-gray-300 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-blue focus:outline-none';
const labelCls =
  'block text-xs font-semibold uppercase tracking-wider text-brand-deep';

/**
 * Create/edit modal for a service request. Controlled entirely by the parent:
 * pass `request` to edit an existing row, or `null` to create a new one.
 * `onSubmit` performs the actual create/update; the parent closes the modal.
 */
export function RequestFormModal({
  request,
  onSubmit,
  onClose,
}: {
  request: Request | null;
  onSubmit: (draft: RequestDraft) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<RequestDraft>(() => toDraft(request));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toDraft(request));
    setError(null);
  }, [request]);

  const isEdit = request !== null;

  function set<K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.owner.trim()) {
      setError('Title and owner are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...draft,
        title: draft.title.trim(),
        owner: draft.owner.trim(),
        estimateHours: Number(draft.estimateHours) || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save request.');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit request' : 'New request'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 bg-brand-deep px-6 py-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-white">
            {isEdit ? 'Edit request' : 'New request'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label className={labelCls} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className={`mt-1 ${field}`}
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Short summary of the request"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="team">
                Team
              </label>
              <select
                id="team"
                className={`mt-1 ${field}`}
                value={draft.team}
                onChange={(e) => set('team', e.target.value as Team)}
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="owner">
                Owner
              </label>
              <input
                id="owner"
                className={`mt-1 ${field}`}
                value={draft.owner}
                onChange={(e) => set('owner', e.target.value)}
                placeholder="Accountable person"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                className={`mt-1 ${field}`}
                value={draft.priority}
                onChange={(e) => set('priority', e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className={`mt-1 ${field}`}
                value={draft.status}
                onChange={(e) => set('status', e.target.value as Status)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="estimateHours">
                Estimate (hours)
              </label>
              <input
                id="estimateHours"
                type="number"
                min={0}
                className={`mt-1 ${field}`}
                value={draft.estimateHours}
                onChange={(e) => set('estimateHours', Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="createdOn">
                Created on
              </label>
              <input
                id="createdOn"
                type="date"
                className={`mt-1 ${field}`}
                value={draft.createdOn}
                onChange={(e) => set('createdOn', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="contoso-btn border border-gray-300 px-4 py-1.5 text-xs text-brand-deep hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="contoso-btn bg-brand-blue px-5 py-1.5 text-xs text-white hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
