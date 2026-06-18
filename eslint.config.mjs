import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Next.js 16's preset enables this as an error, but it flags legitimate
      // patterns used throughout this codebase: fetch-on-mount loading flags,
      // prop→state synchronization, portal hydration guards and modal
      // mount/unmount animation. None are actual bugs, so we disable this one
      // rule project-wide. Other react-hooks rules (incl. exhaustive-deps)
      // stay active.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
