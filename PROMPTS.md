# PROMPTS.md — ENG-163087: Frequent Flyer Portal

Prompts and reasoning used during development. Written to explain *why* things were built the way they were, not just what was built.

---

## File Structure

Kept it flat and obvious. No feature folders, no barrel exports, no over-engineering for a five-screen internal tool.

```
src/
├── __tests__/          # all tests in one place
├── components/         # dumb, reusable UI pieces
├── App.tsx             # single source of truth for state
├── types.ts            # shared interfaces only
├── mockData.ts         # seed data + delay helper
├── utils.ts            # pure functions, easy to unit test
├── index.css           # one CSS file, custom properties only
└── setupTests.ts       # jest-dom import, nothing else
```

Why this way:
- Any new dev can open the folder and immediately know where things live
- Utils stay pure (no React imports) so they're trivial to test
- One CSS file with custom properties is easier to scan than scattered module files for a project this size

---

## Logic Decisions

### State lives in App.tsx only

All member state (`members`, `status`, `editingMember`, `isSubmitting`) lives in `App`. Components receive data and callbacks via props. No context, no store, no prop drilling deeper than one level — the app is small enough that this is the right call.

### Async load uses `useEffect` + promise chain

```ts
useEffect(() => {
  let cancelled = false;
  setStatus('loading');

  simulateDelay(400)
    .then(() => { if (!cancelled) { setMembers([...MOCK_MEMBERS]); setStatus('ready'); } })
    .catch((err) => { if (!cancelled) { setErrorMsg(...); setStatus('error'); } });

  return () => { cancelled = true; };
}, [retryToken]);
```

The `cancelled` flag prevents state updates after unmount. `retryToken` is just a counter that increments on retry — incrementing it triggers the effect again without any extra logic. Clean pattern, no library needed.

### Form resets via `key` prop, not `useEffect`

When the user clicks Edit, the form needs to populate with that member's data. The naive approach is a `useEffect` watching `editingMember` and calling `setState` inside — but that violates the ESLint react-hooks rule and causes a double-render.

Better approach: wrap the form in a thin component that passes a `key` derived from the editing target:

```tsx
const key = editingMember ? `edit-${editingMember.id}` : 'add-new';
return <InnerForm key={key} initialValues={...} />;
```

React unmounts and remounts `InnerForm` when the key changes. The form starts fresh with the right values. No effects, no stale state, no extra rerenders.

### Validation is a pure function

`validateMember(data, existingIds, editingId?)` takes plain objects and returns an errors object. No React, no side effects. This makes it dead simple to unit test every edge case without rendering anything.

### Duplicate ID check accounts for edit mode

When editing, the member's own ID should not trigger a "duplicate" error. The function receives the `editingId` and skips the check when they match:

```ts
if (existingIds.includes(data.id) && data.id !== editingId) {
  errors.id = 'This Membership ID already exists.';
}
```

### Analytics log on every write

Every successful add, edit, or delete calls `logAnalytics(action)` which logs:
```
[Analytics] User interacted with End-to-End Frequent Flyer Portal: added member FF-001
```
Centralised in one util function so the format is consistent and easy to replace with a real analytics call later.

---

## CSS Approach

Single `index.css` file. Custom properties at the top, then component styles. No utility classes, no frameworks, no CSS-in-JS.

### Why custom properties instead of hardcoded values

```css
:root {
  --clr-text:    #0f172a;
  --space-4:     16px;
  --radius-md:   6px;
}
```

Every spacing value and colour is defined once. If the brand colour changes, it's one line. Consistent 4px/8px/12px/16px/24px/32px spacing scale keeps the layout coherent without measuring pixels.

### Monochromatic palette

The brief asked for a corporate floor-staff tool, not a consumer app. One dark colour (`#0f172a`) used throughout — for header background, borders on focus, button fills. Tier badges use muted tints (warm amber for Gold, cool slate for Silver etc.) that complement rather than clash with the grey base.

### Focus rings are explicit

```css
.btn:focus-visible {
  outline: 3px solid var(--clr-border-focus);
  outline-offset: 2px;
}
```

Every interactive element has a visible `:focus-visible` ring. This is not optional — keyboard users need to see where they are.

### Responsive via a single grid breakpoint

```css
.portal-grid { grid-template-columns: 1fr 380px; }
@media (max-width: 900px) { .portal-grid { grid-template-columns: 1fr; } }
```

On wide screens, form sits alongside the table. On narrow screens, they stack. No complex breakpoint system needed for a two-column layout.

---

## Testing Approach

Tests written before the implementation (TDD). The test file defines what the component *must* do; the component is then written to satisfy it.

Covered:
- All validation rules (required fields, email format, negative miles, duplicate IDs)
- Search filtering by ID, name, and email
- Add / edit / delete flows
- Analytics log fires on each write
- Network error shows banner with retry button
- Empty search result shows "No data found"
- Form fields all have accessible labels

`getByRole` and `getByLabelText` used throughout — tests query the DOM the same way a user (or screen reader) would, not by class name or test ID.

---

## What is mock-only

There is no backend. `simulateDelay()` fakes network latency. All data resets on page reload. This is intentional for the scope of this ticket — the interfaces and state shape are ready to swap in real API calls when a backend exists.
