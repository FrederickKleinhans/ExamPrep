const SUPPORT_UNLOCK_KEY = 'certarc_support_unlocks';

type SupportUnlocks = Record<string, boolean>;

function readUnlocks(): SupportUnlocks {
  try {
    const raw = localStorage.getItem(SUPPORT_UNLOCK_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as SupportUnlocks;
  } catch {
    return {};
  }
}

export function hasSupportUnlock(certId: string): boolean {
  return readUnlocks()[certId] === true;
}

export function grantSupportUnlock(certId: string): void {
  localStorage.setItem(SUPPORT_UNLOCK_KEY, JSON.stringify({
    ...readUnlocks(),
    [certId]: true,
  }));
}
