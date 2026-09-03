/**
 * Set `data-theme` BEFORE the browser paints its first frame.
 *
 * 🔴 If React sets it after hydration, a reader who chose dark mode gets a **white
 * flash** every time they open a page — and that is the one thing they will remember
 * about the interface. This script runs synchronously in `<head>`, ahead of
 * everything else.
 *
 * 🔴 There is exactly ONE way into dark mode: the `data-theme` attribute on `<html>`.
 * The system preference is read in JS and then **funnelled into that same
 * attribute** — deliberately NOT a bare `@media (prefers-color-scheme: dark)` in CSS.
 * Two routes would have to be kept in agreement forever, and the moment they diverge
 * the page fights itself as soon as the reader changes their system setting. 9Scan-A1
 * uses this exact mechanism; diverging means two surfaces of one product behaving
 * differently.
 */
const CODE = `
(function () {
  try {
    var stored = localStorage.getItem('9chain-theme');
    var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {
    /* localStorage blocked (strict private mode / iframe): fall back to light.
       Do NOT leave the attribute unset — CSS only applies dark when
       data-theme='dark', so a missing attribute still renders light, but setting it
       explicitly lets ThemeToggle read the current state instead of guessing. */
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: CODE }} />;
}
