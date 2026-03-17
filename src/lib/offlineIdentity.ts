export function sanitizeStorageId(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  const invalidValues = new Set(['undefined', 'null', 'nan', 'false']);
  if (invalidValues.has(normalized.toLowerCase())) return undefined;

  return normalized;
}

function getOutletIdFromCache(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const rawCache = localStorage.getItem('outlet_cache');
  if (!rawCache) return undefined;

  try {
    const parsed = JSON.parse(rawCache) as { outletId?: string | null };
    const cachedOutletId = sanitizeStorageId(parsed?.outletId ?? undefined);

    if (cachedOutletId) {
      localStorage.setItem('selectedOutletId', cachedOutletId);
      return cachedOutletId;
    }
  } catch {
    localStorage.removeItem('outlet_cache');
  }

  return undefined;
}

export function getSelectedOutletIdFromStorage(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const raw = localStorage.getItem('selectedOutletId');
  const sanitized = sanitizeStorageId(raw);

  if (sanitized) {
    return sanitized;
  }

  if (raw) {
    localStorage.removeItem('selectedOutletId');
  }

  return getOutletIdFromCache();
}

export function resolveOfflineUserId(params: {
  userId?: string | null;
  isTeamMember: boolean;
  ownerId?: string | null;
}): string | undefined {
  const source = params.isTeamMember ? params.ownerId : params.userId;
  return sanitizeStorageId(source ?? undefined);
}
