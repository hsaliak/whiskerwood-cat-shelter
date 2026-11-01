const WALK_SPEED_PIXELS_PER_SECOND = 190;
const MIN_WALK_DURATION_MS = 650;
const MAX_WALK_DURATION_MS = 3600;

export function getWalkDuration(distance) {
  if (!Number.isFinite(distance) || distance <= 0) return MIN_WALK_DURATION_MS;
  return Math.round(Math.min(
    MAX_WALK_DURATION_MS,
    Math.max(MIN_WALK_DURATION_MS, (distance / WALK_SPEED_PIXELS_PER_SECOND) * 1000),
  ));
}
