export interface TierInfo {
  label: string;
  color: string;
  minPoints: number;
}

const TIERS: TierInfo[] = [
  { label: "Platinum", color: "#A8B5C8", minPoints: 1500 },
  { label: "Gold", color: "#C5A880", minPoints: 500 },
  { label: "Silver", color: "#9BA5B7", minPoints: 80 },
  { label: "Bronze", color: "#A0785A", minPoints: 0 },
];

export function getTierInfo(points: number): TierInfo {
  for (const tier of TIERS) {
    if (points >= tier.minPoints) return tier;
  }
  return TIERS[TIERS.length - 1];
}

export function getNextTier(points: number): TierInfo | null {
  const current = getTierInfo(points);
  const idx = TIERS.findIndex((t) => t.label === current.label);
  if (idx <= 0) return null;
  return TIERS[idx - 1];
}

export function getTierProgress(points: number): {
  current: TierInfo;
  next: TierInfo | null;
  pointsToNext: number;
  progress: number;
} {
  const current = getTierInfo(points);
  const next = getNextTier(points);
  if (!next) {
    return { current, next: null, pointsToNext: 0, progress: 100 };
  }
  const range = next.minPoints - current.minPoints;
  const earned = points - current.minPoints;
  const progress = Math.min(100, Math.round((earned / range) * 100));
  const pointsToNext = next.minPoints - points;
  return { current, next, pointsToNext, progress };
}

export function getTierMessage(tier: TierInfo): string {
  switch (tier.label) {
    case "Platinum":
      return "You've reached our highest tier — exclusive perks await.";
    case "Gold":
      return "Gold members enjoy early access to new roasts.";
    case "Silver":
      return "You're on your way — keep earning those points.";
    default:
      return "Welcome to Antonioni Grounds Reserve.";
  }
}
