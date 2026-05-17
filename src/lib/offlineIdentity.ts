import { localStore } from '@/lib/localStore';

export function sanitizeStorageId(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  const invalidValues = new Set(['undefined', 'null', 'nan', 'false']);
  if (invalidValues.has(normalized.toLowerCase())) return undefined;

  return normalized;
}

function getOutletIdFromCache(): string | undefined {
  const parsed = localStore.raw.get<{ outletId?: string | null } | null>('outlet_cache', null);
  if (!parsed) return undefined;

  try {
    const cachedOutletId = sanitizeStorageId(parsed.outletId ?? undefined);
    if (cachedOutletId) {
      localStore.raw.setString('selectedOutletId', cachedOutletId);
      return cachedOutletId;
    }
  } catch {
    localStore.raw.remove('outlet_cache');
  }

  return undefined;
}

export function getSelectedOutletIdFromStorage(): string | undefined {
  const raw = localStore.raw.getString('selectedOutletId');
  const sanitized = sanitizeStorageId(raw);

  if (sanitized) {
    return sanitized;
  }

  if (raw) {
    localStore.raw.remove('selectedOutletId');
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
