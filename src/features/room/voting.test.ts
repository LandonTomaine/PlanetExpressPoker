import { describe, expect, it } from 'vitest'
import {
  fibonacciDeck,
  getCardArtworkLabel,
  getCardDisplayLabel,
  getCardMeaningLabel,
  isNumericCardValue,
  numericCardValues,
} from './voting'

describe('voting deck', () => {
  it('uses Fibonacci cards plus special conversation cards', () => {
    expect(numericCardValues).toEqual(['0', '1', '2', '3', '5', '8', '13'])
    expect(fibonacciDeck).toEqual([
      '0',
      '1',
      '2',
      '3',
      '5',
      '8',
      '13',
      'ship',
      'BIG',
      'nibbler',
      'coffee',
    ])
  })

  it('detects numeric cards', () => {
    expect(isNumericCardValue('8')).toBe(true)
    expect(isNumericCardValue('ship')).toBe(false)
  })

  it('maps special cards to their visible meanings', () => {
    expect(getCardDisplayLabel('ship')).toBe('∞')
    expect(getCardDisplayLabel('BIG')).toBe('BIG')
    expect(getCardDisplayLabel('nibbler')).toBe('?')
    expect(getCardDisplayLabel('coffee')).toBe('N/A')
  })

  it('keeps artwork labels separate from score labels', () => {
    expect(getCardArtworkLabel('ship', 'futurama')).toBe('Planet Express ship')
    expect(getCardArtworkLabel('ship', 'zootopia')).toBe('ZPD cruiser')
    expect(getCardArtworkLabel('BIG', 'futurama')).toBe('Lrrr')
    expect(getCardArtworkLabel('BIG', 'zootopia')).toBe('Mr. Big')
    expect(getCardArtworkLabel('coffee', 'zootopia')).toBe('Coffee')
    expect(getCardArtworkLabel('ship', 'toy-story')).toBe('Buzz Lightyear')
    expect(getCardArtworkLabel('BIG', 'toy-story')).toBe('Rex')
    expect(getCardMeaningLabel('13')).toBeNull()
  })
})
