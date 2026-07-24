import { describe, expect, it } from 'vitest'
import { bannerHeight } from './gameHeaderModel'

describe('bannerHeight', () => {
  it('adds content band below safe-area inset', () => {
    expect(bannerHeight(0)).toBe(96)
    expect(bannerHeight(59)).toBe(155)
  })
})
