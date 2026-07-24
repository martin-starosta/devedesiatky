import { describe, expect, it } from 'vitest'
import { actIRelicIds, relics } from './relics'

describe('relic content contracts', () => {
  it('resolves Act I relic ids', () => {
    expect(actIRelicIds.length).toBe(3)
    for (const id of actIRelicIds) {
      expect(relics[id].titleSk.length).toBeGreaterThan(0)
    }
  })
})
