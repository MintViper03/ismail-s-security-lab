import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom type scale in styles.css (`text-small`, `text-h2`, …)
// so it treats them as font sizes instead of colours and keeps e.g. `text-accent-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["meta", "small", "body", "lede", "h3", "h2", "h1", "feature", "display", "hero"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
