import { describe, expect, it } from 'vitest'
import {
  companies,
  factCards,
  timelineEvents,
  timelineEventsById,
  type FactId,
} from './index'

describe('timeline content contracts', () => {
  it('resolves every event, fact, and referenced company id', () => {
    for (const event of timelineEvents) {
      expect(timelineEventsById[event.id]).toBe(event)
      expect(factCards[event.factId as FactId]).toBeDefined()
      expect(factCards[event.factId].sourceHook.length).toBeGreaterThan(0)
      expect(event.choices.length).toBeGreaterThan(0)
    }

    for (const fact of Object.values(factCards)) {
      expect(fact.bodySk.split(/[.!?]/).filter(Boolean).length).toBeLessThanOrEqual(4)
    }

    // Patronage companies used by FNM remain addressable from content.
    expect(Object.keys(companies).length).toBeGreaterThanOrEqual(6)
  })
})
