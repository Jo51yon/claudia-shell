# Changelog

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
