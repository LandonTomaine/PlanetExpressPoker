import {
  isNumericCardValue,
  numericCardValues as deckNumericCardValues,
} from './voting'

export const unsureVoteWeight = 0.75

export type ScoreVote = {
  cardValue: string
  isUnsure: boolean
}

const fibonacciStepByValue = new Map(
  deckNumericCardValues.map((cardValue, index) => [cardValue, index])
)

export type ScoreSummary = {
  averageCalculationLabel: string
  averageLabel: string
  numericVoteCount: number
  numericVotesLabel: string
  recommendationExplanation: string
  recommendedLabel: string
  unanimousNumericValue: number | null
  weightingLabel: string
}

function getNumericVotes(votes: ScoreVote[]) {
  return votes
    .filter((vote) => isNumericCardValue(vote.cardValue))
    .map((vote) => ({
      ...vote,
      value: Number(vote.cardValue),
      weight: vote.isUnsure ? unsureVoteWeight : 1,
    }))
    .sort((left, right) => left.value - right.value)
}

function formatAverage(averageValue: number) {
  return (
    deckNumericCardValues.find(
      (cardValue) => Number(cardValue) >= averageValue
    ) ?? deckNumericCardValues[deckNumericCardValues.length - 1]!
  )
}

function formatRawAverage(averageValue: number) {
  return Number.isInteger(averageValue)
    ? String(averageValue)
    : averageValue.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function getMedianExplanation(
  numericVotes: number[],
  recommendedValue: number
) {
  const middleIndex = Math.floor(numericVotes.length / 2)

  if (numericVotes.length % 2 === 1) {
    return `Middle numeric vote: ${recommendedValue}.`
  }

  return `Middle votes: ${numericVotes[middleIndex - 1]} and ${numericVotes[middleIndex]}. Uses the lower middle card: ${recommendedValue}.`
}

function hasWideSpread(numericCardValues: string[]) {
  if (numericCardValues.length < 2) {
    return false
  }

  const lowestStep = fibonacciStepByValue.get(
    numericCardValues[0] as (typeof deckNumericCardValues)[number]
  )
  const highestStep = fibonacciStepByValue.get(
    numericCardValues[
      numericCardValues.length - 1
    ] as (typeof deckNumericCardValues)[number]
  )

  if (lowestStep === undefined || highestStep === undefined) {
    return false
  }

  return highestStep - lowestStep > 2
}

export function buildScoreSummary(votes: ScoreVote[]): ScoreSummary {
  const numericVotes = getNumericVotes(votes)
  const numericCardValues = numericVotes.map((vote) => vote.cardValue)
  const numericVoteValues = numericVotes.map((vote) => vote.value)

  if (numericVotes.length === 0) {
    return {
      averageCalculationLabel: 'No numeric cards to average.',
      averageLabel: 'No numeric votes',
      numericVoteCount: 0,
      numericVotesLabel: 'Special cards are excluded.',
      recommendationExplanation: 'No numeric card can be suggested.',
      recommendedLabel: 'No recommendation',
      unanimousNumericValue: null,
      weightingLabel: '',
    }
  }

  const weightedTotal = numericVotes.reduce(
    (total, vote) => total + vote.value * vote.weight,
    0
  )
  const totalWeight = numericVotes.reduce(
    (total, vote) => total + vote.weight,
    0
  )
  const averageValue = weightedTotal / totalWeight
  const roundedAverage = formatAverage(averageValue)
  const hasUnsureNumericVote = numericVotes.some((vote) => vote.isUnsure)
  const numericVotesLabel = hasUnsureNumericVote
    ? `Numeric votes: ${numericVotes
        .map((vote) =>
          vote.isUnsure
            ? `${vote.value} (unsure × 75%)`
            : `${vote.value} (regular)`
        )
        .join(' + ')}.`
    : `Votes used: ${numericVoteValues.join(' + ')} = ${formatRawAverage(weightedTotal)}.`
  const averageCalculationLabel = hasUnsureNumericVote
    ? `Weighted total: ${formatRawAverage(weightedTotal)} ÷ ${formatRawAverage(totalWeight)} vote weight = ${formatRawAverage(averageValue)}; rounded up to ${roundedAverage}.`
    : `${formatRawAverage(weightedTotal)} ÷ ${numericVotes.length} = ${formatRawAverage(averageValue)}; rounded up to ${roundedAverage}.`
  const weightingLabel = hasUnsureNumericVote
    ? 'Unsure numeric votes count at 75% for the average. Special cards are excluded.'
    : 'Regular numeric votes count at 100%. Special cards are excluded.'
  const unanimousNumericValue = numericVoteValues.every(
    (cardValue) => cardValue === numericVoteValues[0]
  )
    ? numericVoteValues[0]
    : null

  if (unanimousNumericValue !== null) {
    return {
      averageCalculationLabel,
      averageLabel: roundedAverage,
      numericVoteCount: numericVoteValues.length,
      numericVotesLabel,
      recommendationExplanation: 'All numeric votes match.',
      recommendedLabel: String(unanimousNumericValue),
      unanimousNumericValue,
      weightingLabel,
    }
  }

  if (hasWideSpread(numericCardValues)) {
    return {
      averageCalculationLabel,
      averageLabel: roundedAverage,
      numericVoteCount: numericVoteValues.length,
      numericVotesLabel,
      recommendationExplanation: `Votes range from ${numericVoteValues[0]} to ${numericVoteValues[numericVoteValues.length - 1]}, which is more than two card steps apart.`,
      recommendedLabel: 'Discuss',
      unanimousNumericValue: null,
      weightingLabel,
    }
  }

  const middleIndex = Math.floor(numericVoteValues.length / 2)
  const recommendedValue =
    numericVoteValues.length % 2 === 1
      ? numericVoteValues[middleIndex]
      : numericVoteValues[middleIndex - 1]

  return {
    averageCalculationLabel,
    averageLabel: roundedAverage,
    numericVoteCount: numericVoteValues.length,
    numericVotesLabel,
    recommendationExplanation: getMedianExplanation(
      numericVoteValues,
      recommendedValue
    ),
    recommendedLabel: String(recommendedValue),
    unanimousNumericValue: null,
    weightingLabel,
  }
}
