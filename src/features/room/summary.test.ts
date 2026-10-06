import { describe, expect, it } from 'vitest'
import { buildScoreSummary } from './summary'

function vote(cardValue: string, isUnsure = false) {
  return { cardValue, isUnsure }
}

describe('buildScoreSummary', () => {
  it('returns no recommendation when there are no numeric votes', () => {
    expect(
      buildScoreSummary([vote('ship'), vote('nibbler'), vote('coffee')])
    ).toEqual({
      averageCalculationLabel: 'No numeric cards to average.',
      averageLabel: 'No numeric votes',
      numericVoteCount: 0,
      numericVotesLabel: 'Special cards are excluded.',
      recommendationExplanation: 'No numeric card can be suggested.',
      recommendedLabel: 'No recommendation',
      unanimousNumericValue: null,
      weightingLabel: '',
    })
  })

  it('recommends the unanimous numeric value', () => {
    expect(buildScoreSummary([vote('3'), vote('3'), vote('3')])).toMatchObject({
      averageLabel: '3',
      numericVoteCount: 3,
      recommendedLabel: '3',
      unanimousNumericValue: 3,
    })
  })

  it('uses the lower median for close non-unanimous estimates', () => {
    expect(buildScoreSummary([vote('1'), vote('2'), vote('3')])).toMatchObject({
      averageLabel: '2',
      numericVoteCount: 3,
      recommendedLabel: '2',
      unanimousNumericValue: null,
    })
  })

  it('rounds the average up to the next available numeric card', () => {
    expect(buildScoreSummary([vote('3'), vote('5')])).toMatchObject({
      averageCalculationLabel: '8 ÷ 2 = 4; rounded up to 5.',
      averageLabel: '5',
      numericVotesLabel: 'Votes used: 3 + 5 = 8.',
      recommendationExplanation:
        'Middle votes: 3 and 5. Uses the lower middle card: 3.',
      recommendedLabel: '3',
    })
  })

  it('recommends discussion for wide Fibonacci spreads', () => {
    expect(buildScoreSummary([vote('1'), vote('8')])).toMatchObject({
      averageLabel: '5',
      recommendedLabel: 'Discuss',
    })
  })

  it('counts unsure numeric votes at 75% and explains the weighted average', () => {
    expect(buildScoreSummary([vote('3'), vote('5', true)])).toMatchObject({
      averageCalculationLabel:
        'Weighted total: 6.75 ÷ 1.75 vote weight = 3.86; rounded up to 5.',
      averageLabel: '5',
      numericVotesLabel: 'Numeric votes: 3 (regular) + 5 (unsure × 75%).',
      recommendedLabel: '3',
      weightingLabel:
        'Unsure numeric votes count at 75% for the average. Special cards are excluded.',
    })
  })
})
