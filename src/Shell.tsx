import type { ComponentType } from 'react';

/**
 * A row from the consuming app's own `{project}_shell_tabs` table (or equivalent). This
 * package never reads a database — the consumer fetches its own tabs and passes them in.
 * Deliberately matches the shape Claudia's own claudia_shell_tabs table used first
 * (see docs/_platform/shell-pattern-scoping.md in the claudia repo), so an existing table
 * needs no reshaping to adopt this package — but nothing here requires that exact table.
 */
export interface ShellTab {
  tab_key: string;
  label: string;
  /** A plain name looked up in the `icons` map this package is given — see Shell's props.
   *  This package never imports an icon library itself; see README "Why no icon import". */
  icon: string | null;
  /** Key into the CONSUMING APP's own lazy-load registry. This package does not, and cannot,
   *  hold that registry: a dynamic `import()` path is only meaningful from inside the file
   *  tree that actually contains the target module, which is always the consuming app's own
   *  source, never this package's. See README "What this package does not do". */
  component_name: string;
  display_order: number;
  /** `'always'` or any app-defined role string (e.g. `'superadmin'`) — checked against
   *  `visibleRoles`, not hardcoded here. A tab with any other visible_if value that isn't in
   *  `visibleRoles` simply doesn't render; there is no special-cased role name in this package. */
  visible_if: string;
  /** Key looked up in the `badges` prop, e.g. `{ decisionCount: 3 }`. Null means no badge. */
  badge_key: string | null;
}

/**
 * Every class name Shell applies, all overridable. Defaults are deliberately generic
 * (`sidebar`, `nav-item`, `active`) because that's what checking real sibling packages found:
 * Claudia's own dashboard uses `sidebar-nav-item`, Lintel and PETGI both independently
 * converged on plain `nav-item` — there is no one true name across this ecosystem, so Shell
 * cannot hardcode any single app's convention and match everyone. Pass the consuming app's
 * own existing class names here to pick up its current CSS with zero new stylesheet needed —
 * this is also why Shell ships no style.css of its own (see README "On not shipping CSS").
 */
export interface ShellClassNames {
  nav?: string;
  header?: string;
  navList?: string;
  navItem?: string;
  navItemActive?: string;
  badge?: string;
  footer?: string;
  signOutButton?: string;
}

const DEFAULT_CLASSES: Required<ShellClassNames> = {
  nav: 'sidebar',
  header: 'sidebar-header',
  navList: 'sidebar-nav',
  navItem: 'nav-item',
  navItemActive: 'active',
  badge: 'nav-badge',
  footer: 'sidebar-footer',
  signOutButton: 'nav-item',
};

export interface ShellProps {
  tabs: ShellTab[];
  active: string;
  onSelect: (tabKey: string) => void;
  onSignOut: () => void;
  /** Icons this app actually uses, keyed by the plain name stored in `ShellTab.icon`. Pass
   *  only what you import — see README for why this package never imports an icon library. */
  icons?: Record<string, ComponentType<{ size?: number; 'aria-hidden'?: boolean }>>;
  /** Roles/flags that make a non-'always' tab visible, e.g. ['superadmin'] for an admin user,
   *  [] for an ordinary one. A tab's visible_if must appear in this list (or be 'always'). */
  visibleRoles?: string[];
  badges?: Record<string, number>;
  wordmark?: string;
  /** Overrides the plain-text wordmark entirely when the consuming app has a richer branded
   *  header (an SVG mark, a strapline) than a single text string can express — Lintel's <Mark/>
   *  is exactly this case, found on its first real adoption of this package. When set, this
   *  renders instead of `wordmark`, not alongside it. */
  header?: React.ReactNode;
  /** Rendered inside the footer above the sign-out button — a role pill, a plan badge,
   *  whatever the consuming app wants there. Optional; renders nothing by default. */
  footerExtra?: React.ReactNode;
  /** Override any/all class names Shell applies. Unset keys fall back to DEFAULT_CLASSES.
   *  See ShellClassNames' own doc comment for why this exists instead of a fixed convention. */
  classNames?: ShellClassNames;
}

export default function Shell({
  tabs, active, onSelect, onSignOut, icons = {}, visibleRoles = [], badges = {},
  wordmark = 'App', header, footerExtra, classNames = {},
}: ShellProps) {
  const cx = { ...DEFAULT_CLASSES, ...classNames };
  const items = tabs
    .filter((t) => t.visible_if === 'always' || visibleRoles.includes(t.visible_if))
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <nav className={cx.nav}>
      <div className={cx.header}>
        {header ?? <p>{wordmark}</p>}
      </div>
      <div className={cx.navList}>
        {items.map((item) => {
          const Icon = item.icon ? icons[item.icon] : undefined;
          const badgeValue = item.badge_key ? badges[item.badge_key] : undefined;
          return (
            <button
              key={item.tab_key}
              className={`${cx.navItem}${active === item.tab_key ? ` ${cx.navItemActive}` : ''}`}
              onClick={() => onSelect(item.tab_key)}
            >
              {Icon && <Icon size={16} aria-hidden />}
              <span>{item.label}</span>
              {Boolean(badgeValue) && <span className={cx.badge}>{badgeValue}</span>}
            </button>
          );
        })}
      </div>
      <div className={cx.footer}>
        {footerExtra}
        <button className={cx.signOutButton} onClick={onSignOut}>Sign out</button>
      </div>
    </nav>
  );
}
