import { describe, expect, it } from 'vitest'
import { buildScoreSummary } from './summary'

describe('buildScoreSummary', () => {
  it('returns no recommendation when there are no numeric votes', () => {
    expect(buildScoreSummary(['ship', 'nibbler', 'coffee'])).toEqual({
      averageLabel: 'No numeric votes',
      numericVoteCount: 0,
      recommendedLabel: 'No recommendation',
      unanimousNumericValue: null,
    })
  })

  it('recommends the unanimous numeric value', () => {
    expect(buildScoreSummary(['3', '3', '3'])).toMatchObject({
      averageLabel: '3',
      numericVoteCount: 3,
      recommendedLabel: '3',
      unanimousNumericValue: 3,
    })
  })

  it('uses the lower median for close non-unanimous estimates', () => {
    expect(buildScoreSummary(['1', '2', '3'])).toMatchObject({
      averageLabel: '2',
      numericVoteCount: 3,
      recommendedLabel: '2',
      unanimousNumericValue: null,
    })
  })

  it('recommends discussion for wide Fibonacci spreads', () => {
    expect(buildScoreSummary(['1', '8'])).toMatchObject({
      averageLabel: '4.5',
      recommendedLabel: 'Discuss',
    })
  })
})
