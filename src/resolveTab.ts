import type { ShellTab } from './Shell';

/**
 * Finds a tab by key and confirms it's actually visible to this viewer — the same check every
 * consumer needs before deciding whether to render it or fall back (e.g. Claudia's own App.tsx
 * redirecting an unrecognised/hidden section key back to the default tab). Returns null for
 * "doesn't exist" and for "exists but not visible to this role" alike — deliberately not
 * distinguished, since a caller acting on either case does the same thing: don't render it.
 */
export function resolveTab(
  tabs: ShellTab[],
  tabKey: string,
  visibleRoles: string[] = [],
): ShellTab | null {
  const tab = tabs.find((t) => t.tab_key === tabKey);
  if (!tab) return null;
  if (tab.visible_if !== 'always' && !visibleRoles.includes(tab.visible_if)) return null;
  return tab;
}
