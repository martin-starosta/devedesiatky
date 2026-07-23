/** Tunable Kauzy detonation (condition fires, not countdown fuses). */
export type KauzaCondition = 'journalist' | 'defector' | 'lossOfPower'

export type KauzaStatus = 'latent' | 'muted' | 'detonated'

/** Tags written onto every sponsor-deal ledger entry. */
export const defaultDealConditions: KauzaCondition[] = [
  'journalist',
  'defector',
  'lossOfPower',
]

/** State TV strength at/above which detonation can be muted. */
export const mediaMuteThreshold = 6

/** Reputácia paid when Médiá mutes a kauza. */
export const muteReputaciaCost = 1.5

/** Full detonation Preferencie / Reputácia multipliers on entry pressure. */
export const detonationSwing = {
  preferencie: 0.85,
  reputacia: 0.45,
} as const

/** Muted path keeps a fraction of the Preferencie hit. */
export const mutePreferencieFactor = 0.25
