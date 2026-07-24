import { politikaActions, type PolitikaActionId } from '@devedesiatky/content'

/** Leaf helper — kept out of politika↔npcAi require cycle. */
export function availablePolitikaActions(inGovernment: boolean): PolitikaActionId[] {
  return (Object.keys(politikaActions) as PolitikaActionId[]).filter((id) => {
    const role = politikaActions[id].role
    if (role === 'both') return true
    return inGovernment ? role === 'government' : role === 'opposition'
  })
}
