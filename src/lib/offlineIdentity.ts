export function sanitizeStorageId(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  const invalidValues = new Set(['undefined', 'null', 'nan', 'false']);
  if (invalidValues.has(normalized.toLowerCase())) return undefined;

  return normalized;
}

export function getSelectedOutletIdFromStorage(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const raw = localStorage.getItem('selectedOutletId');
  const sanitized = sanitizeStorageId(raw);

  if (!sanitized && raw) {
    localStorage.removeItem('selectedOutletId');
  }

  return sanitized;
}

export function resolveOfflineUserId(params: {
  userId?: string | null;
  isTeamMember: boolean;
  ownerId?: string | null;
}): string | undefined {
  const source = params.isTeamMember ? params.ownerId : params.userId;
  return sanitizeStorageId(source ?? undefined);
}
