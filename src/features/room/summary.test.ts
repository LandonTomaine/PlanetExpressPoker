import { describe, expect, it } from 'vitest'
import { buildScoreSummary } from './summary'

describe('buildScoreSummary', () => {
  it('returns no recommendation when there are no numeric votes', () => {
    expect(buildScoreSummary(['ship', 'nibbler', 'coffee'])).toEqual({
      averageCalculationLabel: 'No numeric cards to average.',
      averageLabel: 'No numeric votes',
      numericVoteCount: 0,
      numericVotesLabel: 'Special cards are excluded.',
      recommendationExplanation: 'No numeric card can be suggested.',
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

  it('rounds the average up to the next available numeric card', () => {
    expect(buildScoreSummary(['3', '5'])).toMatchObject({
      averageCalculationLabel: '8 ÷ 2 = 4; rounded up to 5.',
      averageLabel: '5',
      numericVotesLabel: 'Votes used: 3 + 5 = 8.',
      recommendationExplanation:
        'Middle votes: 3 and 5. Uses the lower middle card: 3.',
      recommendedLabel: '3',
    })
  })

  it('recommends discussion for wide Fibonacci spreads', () => {
    expect(buildScoreSummary(['1', '8'])).toMatchObject({
      averageLabel: '5',
      recommendedLabel: 'Discuss',
    })
  })
})
