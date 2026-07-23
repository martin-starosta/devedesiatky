export type CompanyId =
  | 'oceliare-vychod'
  | 'strojarne-povazie'
  | 'chemie-zitny-ostrov'
  | 'banictvo-stred'
  | 'potraviny-nitra'
  | 'elektrotechnika-bratislava'

export type SponsorId = 'zelezny-baron' | 'fondovy-zralok'

export type Company = {
  id: CompanyId
  nameSk: string
  regionSk: string
  bookValue: number
}

export type Sponsor = {
  id: SponsorId
  nameSk: string
  /** Multiplier on book value → cash to pokladňa */
  generosity: number
  /** Scales kauza pressure written per deal */
  riskiness: number
}

export const companies: Record<CompanyId, Company> = {
  'oceliare-vychod': {
    id: 'oceliare-vychod',
    nameSk: 'Východné ocele',
    regionSk: 'Východ',
    bookValue: 420_000,
  },
  'strojarne-povazie': {
    id: 'strojarne-povazie',
    nameSk: 'Považské strojárne',
    regionSk: 'Považie',
    bookValue: 280_000,
  },
  'chemie-zitny-ostrov': {
    id: 'chemie-zitny-ostrov',
    nameSk: 'Chémia Žitný ostrov',
    regionSk: 'Juh',
    bookValue: 190_000,
  },
  'banictvo-stred': {
    id: 'banictvo-stred',
    nameSk: 'Stredoslovenské bane',
    regionSk: 'Stred',
    bookValue: 210_000,
  },
  'potraviny-nitra': {
    id: 'potraviny-nitra',
    nameSk: 'Nitrianske potraviny',
    regionSk: 'Nitra',
    bookValue: 120_000,
  },
  'elektrotechnika-bratislava': {
    id: 'elektrotechnika-bratislava',
    nameSk: 'Bratislavská elektrotechnika',
    regionSk: 'Bratislava',
    bookValue: 160_000,
  },
}

export const sponsors: Record<SponsorId, Sponsor> = {
  'zelezny-baron': {
    id: 'zelezny-baron',
    nameSk: 'Železný barón',
    generosity: 0.55,
    riskiness: 1.2,
  },
  'fondovy-zralok': {
    id: 'fondovy-zralok',
    nameSk: 'Fondový žralok',
    generosity: 0.4,
    riskiness: 0.85,
  },
}

export const companyIds = Object.keys(companies) as CompanyId[]
export const sponsorIds = Object.keys(sponsors) as SponsorId[]

/** How many FNM cards to deal each Peniaze phase. */
export const fnmOfferCount = { min: 2, max: 4 }
