'use client';

import { useState } from 'react';

const STATUSES = ['NEW', 'READ', 'CLOSED'] as const;

export function InquiryStatusForm({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: string) {
    const previous = value;
    setValue(next);
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!response.ok) {
      setValue(previous);
      setError('Could not update status');
    }
    setPending(false);
  }

  return (
    <div>
      <label className="sr-only" htmlFor={`inquiry-status-${id}`}>
        Enquiry status
      </label>
      <select
        id={`inquiry-status-${id}`}
        value={value}
        disabled={pending}
        onChange={(event) => void onChange(event.target.value)}
        className="min-h-11 border border-white/20 bg-transparent px-2 py-1 text-sm"
      >
        {STATUSES.map((item) => (
          <option key={item} value={item} className="bg-[#1a1814]">
            {item}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
