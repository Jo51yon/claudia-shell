# @jo51yon/claudia-shell

A DB-driven sidebar/tab shell for Claudia-family apps, extracted from the pattern proven on
Claudia's own dashboard (`claudia_shell_tabs`, see `docs/_platform/shell-pattern-scoping.md` in
the `claudia` repo) and shaped so a second project can adopt it without copying code.

## Install

```json
"dependencies": {
  "@jo51yon/claudia-shell": "git+https://github.com/Jo51yon/claudia-shell.git#main"
}
```

Same pattern as `@jo51yon/claudia-rte` — a private git dependency, not an npm registry publish.

## Usage

```tsx
import { Shell, resolveTab } from '@jo51yon/claudia-shell';
import '@jo51yon/claudia-shell/style.css';
import { LayoutDashboard, Users } from 'lucide-react'; // only the icons you actually use

const icons = { LayoutDashboard, Users };

function App() {
  const [tabs, setTabs] = useState<ShellTab[]>([]);
  const [section, setSection] = useState('overview');
  // fetch tabs from your own {project}_shell_tabs table / RPC — see "What this package does
  // not do" below for why that stays in your app, not this package.

  return (
    <>
      <Shell
        tabs={tabs}
        active={section}
        onSelect={setSection}
        onSignOut={() => supabase.auth.signOut()}
        icons={icons}
        visibleRoles={isSuperadmin ? ['superadmin'] : []}
        badges={{ decisionCount }}
        wordmark="MyApp"
      />
      <main>{renderContent(section, tabs)}</main>
    </>
  );
}
```

## What this package does not do

**It does not hold your lazy-load registry.** A dynamic `import('./components/Foo')` is only
meaningful from inside the file tree that actually contains `Foo` — this package's own source
tree, not yours. That means the `component_name` -> actual component mapping stays in your app,
written the same way Claudia's own `ShellRegistry.tsx` does:

```tsx
const REGISTRY: Record<string, React.ComponentType> = {
  MyPanel: lazy(() => import('./components/MyPanel')),
};
function renderContent(section: string, tabs: ShellTab[]) {
  const tab = resolveTab(tabs, section, visibleRoles);
  if (!tab) return null;
  const Component = REGISTRY[tab.component_name];
  return Component ? <Component /> : null;
}
```

This is a real constraint of how JavaScript module loading works, not a missing feature —
stated plainly here so nobody spends time looking for a way to configure it away.

**It does not import an icon library.** `import * as LucideIcons from 'lucide-react'` was tried
during the pattern's first build (on Claudia's own dashboard) and caught live: it pulls every
icon into the bundle regardless of how many are actually used, and tripled the main JS chunk
size before being caught and fixed. `Shell` takes an `icons` prop instead — pass only the icons
your tabs actually reference, and your bundler can tree-shake the rest.

**It does not touch your database.** Each adopting project keeps its own `{project}_shell_tabs`
table (or equivalent) and fetches it however it already fetches data — an RPC, a plain
`select`, whatever the project's existing convention is. This package only renders what you
give it.

**It does not implement your composite/core sections.** Real apps have at least one section
that composes multiple sub-panels or owns cross-cutting state that doesn't fit a single
lazy-loaded component — Claudia's own `overview`/`projects`/`vault` are like this
(`component_name` values prefixed `core:` in its own registry, matched and rendered specially
in `App.tsx` rather than through the generic lookup). Design your own `renderContent` to check
for those before falling through to a generic registry lookup, the same way Claudia's does.

## Theming

Structural CSS only — no color opinions baked in beyond safe fallbacks. Override these custom
properties in your own stylesheet: `--shell-accent`, `--shell-surface`,
`--shell-surface-raised`, `--shell-text`, `--shell-text-dim`, `--shell-ink`.

## Status

v1.0.0. Extracted 2026-08-20 from Claudia's own Stage 1 dashboard shell (shipped and verified
live 2026-08-19) — this is the second real place this shape has been used, not a speculative
design. Not yet adopted by any other project; PETGI is deliberately excluded from being that
second adopter right now (live client demo in progress) and Lintel/S3 Photobook adoption has
not started.
