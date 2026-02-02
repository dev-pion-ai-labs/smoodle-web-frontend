---
name: frontend-best-practises
description: Production-grade frontend best practices for React + Tailwind apps. Covers UX patterns, smooth interactions, accessibility, performance optimization, clean code architecture, and error handling. Use when building any React web application to ensure professional quality, buttery-smooth user experience, and maintainable code.
---

## UX Golden Rules

### Flow & Navigation
- Every action must give instant visual feedback (button press → loading spinner within 50ms)
- Never show blank screens — use skeleton loaders that match the layout shape
- After form submission success, auto-redirect within 1 second (don't make user click again)
- Back button must always work — never trap users
- Breadcrumbs or clear page titles so user always knows where they are
- Maximum 3 clicks to reach any feature from the dashboard

### Forms & Inputs
- Validate on blur (when user leaves field), not on every keystroke
- Show validation errors below the specific field, not as a generic banner
- Auto-focus the first input field when a form page loads
- Show password toggle (eye icon) on all password fields
- Disable submit button while loading, show spinner inside the button
- After successful submit, clear the form or redirect — never leave stale data
- Use placeholder text as hints, not as labels (labels must be visible above the field)
- Tab order must flow naturally top-to-bottom, left-to-right

### Loading States
- Skeleton loaders for page content (gray animated placeholders matching the layout)
- Inline spinners inside buttons during form submissions
- Progress indicators for file uploads (percentage or progress bar)
- "Shimmer" effect on skeleton loaders (subtle left-to-right gradient animation)
- If loading takes more than 5 seconds, show a reassuring message ("Still working...")

### Error Handling
- Toast notifications for transient errors (network issues, API errors) — auto-dismiss after 4 seconds
- Inline error messages for form validation (red text below the field)
- Full-page error state with retry button for page-level failures
- Never show raw error objects or stack traces to users
- Friendly error messages: "Something went wrong. Please try again." not "Error 500: Internal Server Error"
- Offline detection: show a persistent banner "You're offline. Changes will sync when you reconnect."

### Micro-Interactions
- Buttons: scale down slightly on press (active:scale-95), subtle shadow change on hover
- Cards: slight lift on hover (hover:-translate-y-1 hover:shadow-lg)
- Inputs: border color change on focus (focus:ring-2 focus:ring-primary)
- Modals: fade in backdrop + scale up content (transition-all duration-200)
- Page transitions: fade in content (opacity 0 → 1, duration 300ms)
- Toast notifications: slide in from top-right, slide out on dismiss
- Tab switches: smooth underline indicator movement
- Score gauge: animated fill on mount (CSS transition on stroke-dashoffset)

### Empty States
- Every list/table must have a designed empty state
- Include an illustration or icon, a message, and a CTA button
- Example: "No verifications yet" + file icon + "Start Verifying" button
- Never show an empty white area with no explanation

### Responsive Design
- Mobile-first: design for 375px first, then scale up
- Touch targets: minimum 44x44px on mobile
- No horizontal scroll on any screen size
- Stack cards vertically on mobile, grid on desktop
- Hamburger menu on mobile with slide-in drawer
- Tables become cards on mobile (hide columns, show key info)

## Code Architecture

### Component Patterns
- One component per file, named same as the file (Button.jsx exports Button)
- Props destructured at the top of the function
- Default props for optional values
- Use `cn()` utility for conditional Tailwind classes (install clsx + tailwind-merge)
- Keep components under 150 lines — split if larger
- Separate logic hooks from presentation components

### cn() Utility Pattern
```javascript
// src/utils/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### API Service Pattern
```javascript
// Every service function: try/catch, extract data, throw clean errors
export const verifyText = async (text) => {
  try {
    const { data } = await api.post('/verify/text', { text });
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Verification failed';
  }
};
```

### Zustand Store Pattern
```javascript
// Minimal, flat state. Actions next to state.
export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  login: (user, token) => {
    localStorage.setItem('access_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

### File Upload Pattern
- Show drag-over visual feedback (border color change, background tint)
- Preview images immediately using URL.createObjectURL()
- Show file name + size for non-image files
- Validate type + size BEFORE uploading
- Show upload progress bar
- Allow removing the file before submission

## Performance

- Lazy load routes with React.lazy() + Suspense
- Debounce search inputs (300ms)
- Memoize expensive calculations with useMemo
- Avoid re-renders: use useCallback for event handlers passed as props
- Images: use loading="lazy" attribute
- Bundle: keep initial load under 200KB gzipped

## Accessibility Basics

- All interactive elements keyboard-accessible (Tab, Enter, Escape)
- Escape key closes modals
- Focus trap inside open modals
- aria-label on icon-only buttons
- Color contrast: 4.5:1 minimum for text
- Don't rely on color alone to convey information (add icons or text)