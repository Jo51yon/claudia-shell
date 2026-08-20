# Changelog

## 1.2.0 — 2026-08-20

**Design correction, found before this ever reached production.** v1.0.0/v1.1.0 shipped their
own `style.css` with a `--shell-*` custom-property namespace. Checking real sibling packages
(`@jo51yon/claudia-footer`, already adopted by three projects) during Lintel's integration found
this was inconsistent with the actual established pattern: no sibling package ships CSS: they
render plain class names and let each app's own existing stylesheet style them. Also found no
single class-name convention exists to hardcode anyway — Claudia's dashboard uses
`sidebar-nav-item`, Lintel and PETGI both use plain `nav-item`.

- Removed `style.css` entirely.
- `Shell` now applies generic default class names (`sidebar`, `nav-item`, `active`, ...),
  overridable per-element via a new `classNames` prop, so an adopting app can match its own
  existing CSS with zero new stylesheet.
- `ShellClassNames` type exported.

Non-breaking in practice (no export removed, checked), though the *default* rendered class
names changed — safe because nothing had shipped to a live app with v1.0.0/v1.1.0 before this
landed.

## 1.1.0 — 2026-08-20

- `Shell`: added optional `header` prop. When supplied, renders instead of the plain-text
  `wordmark` — found necessary on Lintel's first real adoption attempt, whose sidebar header is
  a branded SVG mark, not a string. Purely additive; no export removed, no existing behavior
  changed for callers not using the new prop.

## 1.0.0 — 2026-08-20

Initial extraction from the shell pattern proven on Claudia's own dashboard
(`claudia_shell_tabs`, shipped and verified live 2026-08-19).

- `Shell`: renders a sidebar from a `ShellTab[]` prop. Icon resolution via an injected `icons`
  map (no icon library import in this package — see README).
- `resolveTab`: finds a tab by key and confirms role visibility, for use before rendering
  content or redirecting an unrecognised/hidden section.
- `style.css`: structural styles only, themed via `--shell-*` custom properties.

Does not include a lazy-load registry or database access — see README "What this package does
not do" for why, and the pattern to use instead.
