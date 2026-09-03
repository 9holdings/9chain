/**
 * Join class names, dropping empty values.
 *
 * 🔴 IT LIVES HERE AND NOT IN `components/ui` — that file carries `'use client'`, and
 * anything exported from a client module may only be **rendered as a component** or
 * passed through props. A server component that CALLS it fails the build with
 * "Attempted to call cx() from the server but cx is on the client", which names the
 * function and says nothing about the boundary that was crossed. Pure functions stay
 * outside the boundary.
 */
export function cx(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ');
}
