import {
  isNumericCardValue,
  numericCardValues as deckNumericCardValues,
} from './voting'

const fibonacciStepByValue = new Map(
  deckNumericCardValues.map((cardValue, index) => [cardValue, index])
)

export type ScoreSummary = {
  averageLabel: string
  numericVoteCount: number
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
  return Number.isInteger(averageValue)
    ? String(averageValue)
    : averageValue.toFixed(1)
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
      averageLabel: 'No numeric votes',
      numericVoteCount: 0,
      recommendedLabel: 'No recommendation',
      unanimousNumericValue: null,
    }
  }

  const sum = numericVotes.reduce((total, cardValue) => total + cardValue, 0)
  const averageValue = sum / numericVotes.length
  const unanimousNumericValue = numericVotes.every(
    (cardValue) => cardValue === numericVotes[0]
  )
    ? numericVotes[0]
    : null

  if (unanimousNumericValue !== null) {
    return {
      averageLabel: formatAverage(averageValue),
      numericVoteCount: numericVotes.length,
      recommendedLabel: String(unanimousNumericValue),
      unanimousNumericValue,
    }
  }

  if (hasWideSpread(numericCardValues)) {
    return {
      averageLabel: formatAverage(averageValue),
      numericVoteCount: numericVotes.length,
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
    averageLabel: formatAverage(averageValue),
    numericVoteCount: numericVotes.length,
    recommendedLabel: String(recommendedValue),
    unanimousNumericValue: null,
  }
}
