import {
  isNumericCardValue,
  numericCardValues as deckNumericCardValues,
} from './voting'

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
}

function getNumericVotes(cardValues: string[]) {
  return cardValues
    .filter((cardValue) => isNumericCardValue(cardValue))
    .map((cardValue) => Number(cardValue))
    .sort((left, right) => left - right)
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

export function buildScoreSummary(cardValues: string[]): ScoreSummary {
  const numericCardValues = cardValues
    .filter((cardValue) => isNumericCardValue(cardValue))
    .sort((left, right) => Number(left) - Number(right))
  const numericVotes = getNumericVotes(cardValues)

  if (numericVotes.length === 0) {
    return {
      averageCalculationLabel: 'No numeric cards to average.',
      averageLabel: 'No numeric votes',
      numericVoteCount: 0,
      numericVotesLabel: 'Special cards are excluded.',
      recommendationExplanation: 'No numeric card can be suggested.',
      recommendedLabel: 'No recommendation',
      unanimousNumericValue: null,
    }
  }

  const sum = numericVotes.reduce((total, cardValue) => total + cardValue, 0)
  const averageValue = sum / numericVotes.length
  const roundedAverage = formatAverage(averageValue)
  const numericVotesLabel = `Votes used: ${numericVotes.join(' + ')} = ${sum}.`
  const averageCalculationLabel = `${sum} ÷ ${numericVotes.length} = ${formatRawAverage(averageValue)}; rounded up to ${roundedAverage}.`
  const unanimousNumericValue = numericVotes.every(
    (cardValue) => cardValue === numericVotes[0]
  )
    ? numericVotes[0]
    : null

  if (unanimousNumericValue !== null) {
    return {
      averageCalculationLabel,
      averageLabel: roundedAverage,
      numericVoteCount: numericVotes.length,
      numericVotesLabel,
      recommendationExplanation: 'All numeric votes match.',
      recommendedLabel: String(unanimousNumericValue),
      unanimousNumericValue,
    }
  }

  if (hasWideSpread(numericCardValues)) {
    return {
      averageCalculationLabel,
      averageLabel: roundedAverage,
      numericVoteCount: numericVotes.length,
      numericVotesLabel,
      recommendationExplanation: `Votes range from ${numericVotes[0]} to ${numericVotes[numericVotes.length - 1]}, which is more than two card steps apart.`,
      recommendedLabel: 'Discuss',
      unanimousNumericValue: null,
    }
  }

  const middleIndex = Math.floor(numericVotes.length / 2)
  const recommendedValue =
    numericVotes.length % 2 === 1
      ? numericVotes[middleIndex]
      : numericVotes[middleIndex - 1]

  return {
    averageCalculationLabel,
    averageLabel: roundedAverage,
    numericVoteCount: numericVotes.length,
    numericVotesLabel,
    recommendationExplanation: getMedianExplanation(
      numericVotes,
      recommendedValue
    ),
    recommendedLabel: String(recommendedValue),
    unanimousNumericValue: null,
  }
}
