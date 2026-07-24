/** Voľby '94 deck boss — GDD §10.4 defaults (content-tunable). */

export type BossIntentId = 'smear' | 'mobilize' | 'pressure'

export const bossSupportBase = 40
export const bossAdvantageSupportBonus = 10
/** Extra bossSupport per point of SIS Pozornosť. */
export const pozornostBossSupportPerPoint = 2
export const bossMaxRounds = 5
export const bossPreferencieFloor = 5

export const bossIntentDefs: Record<
  BossIntentId,
  {
    labelSk: string
    /** Smear Preferencie damage before player block. */
    smearDamage?: number
    /** Mobilize: boss gains this much block. */
    bossBlockGain?: number
    /** International pressure: Reputácia hit. */
    reputaciaHit?: number
    /** Buff next smear damage by this amount. */
    nextSmearBuff?: number
  }
> = {
  smear: {
    labelSk: 'Špina v médiách (−Preferencie)',
    smearDamage: 8,
  },
  mobilize: {
    labelSk: 'Mobilizácia mladých (+blok)',
    bossBlockGain: 6,
  },
  pressure: {
    labelSk: 'Medzinárodný tlak (−Reputácia)',
    reputaciaHit: 1.5,
    nextSmearBuff: 3,
  },
}

export const bossIntentOrder: BossIntentId[] = ['smear', 'mobilize', 'pressure']
