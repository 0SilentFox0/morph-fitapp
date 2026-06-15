import {
  LEAGUE_TIERS,
  resolveTier,
  nextTier,
  tierProgress,
  tierByKey,
} from '../../utils/game/leagues';

describe('resolveTier', () => {
  it('maps percentiles to the band that contains them (min inclusive, max exclusive)', () => {
    expect(resolveTier(0).key).toBe('wooden');
    expect(resolveTier(0.39).key).toBe('wooden');
    expect(resolveTier(0.4).key).toBe('bronze'); // boundary lands in the upper band
    expect(resolveTier(0.7).key).toBe('silver');
    expect(resolveTier(0.85).key).toBe('gold');
    expect(resolveTier(0.95).key).toBe('diamond');
    expect(resolveTier(0.995).key).toBe('platinum');
  });

  it('treats the very top (percentile = 1) as platinum', () => {
    expect(resolveTier(1).key).toBe('platinum');
  });

  it('clamps out-of-range input', () => {
    expect(resolveTier(-5).key).toBe('wooden');
    expect(resolveTier(42).key).toBe('platinum');
  });
});

describe('nextTier', () => {
  it('returns the tier one ordinal up', () => {
    expect(nextTier(tierByKey('wooden'))?.key).toBe('bronze');
    expect(nextTier(tierByKey('diamond'))?.key).toBe('platinum');
  });

  it('returns null at the top tier', () => {
    expect(nextTier(tierByKey('platinum'))).toBeNull();
  });
});

describe('tierProgress', () => {
  it('is 0 at the lower edge of a band and approaches 1 at the upper edge', () => {
    expect(tierProgress(0.4)).toBeCloseTo(0); // bronze lower edge
    expect(tierProgress(0.649999)).toBeCloseTo(1, 2); // just under bronze upper edge
  });

  it('is mid-band for a mid value', () => {
    // bronze band [0.4, 0.65), midpoint 0.525
    expect(tierProgress(0.525)).toBeCloseTo(0.5, 5);
  });
});

describe('LEAGUE_TIERS', () => {
  it('tiles [0,1) contiguously with strictly increasing ordinals', () => {
    for (let i = 1; i < LEAGUE_TIERS.length; i++) {
      expect(LEAGUE_TIERS[i]!.minPercentile).toBeCloseTo(LEAGUE_TIERS[i - 1]!.maxPercentile);
      expect(LEAGUE_TIERS[i]!.ordinal).toBe(LEAGUE_TIERS[i - 1]!.ordinal + 1);
    }
    expect(LEAGUE_TIERS[0]!.minPercentile).toBe(0);
    expect(LEAGUE_TIERS[LEAGUE_TIERS.length - 1]!.maxPercentile).toBe(1);
  });
});
