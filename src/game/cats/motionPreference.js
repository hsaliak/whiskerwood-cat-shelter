export function shouldReduceCatMotion(prefersReducedMotion, hasCoarsePointer) {
  return prefersReducedMotion && !hasCoarsePointer;
}
