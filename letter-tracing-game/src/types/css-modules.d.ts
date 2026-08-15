/**
 * Plain-CSS side-effect imports (globals.css in the root layout). Next.js
 * handles these at build time; this declaration keeps a standalone
 * `tsc --noEmit` (the sandbox's substitute for `next build`) at zero errors.
 */
declare module "*.css";
