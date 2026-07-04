export const numericCardValues = ['0', '1', '2', '3', '5', '8', '13'] as const

export const fibonacciDeck = [
  ...numericCardValues,
  'ship',
  'BIG',
  'nibbler',
  'coffee',
] as const

export type PokerCardValue = (typeof fibonacciDeck)[number]

export function isNumericCardValue(cardValue: string) {
  return numericCardValues.includes(
    cardValue as (typeof numericCardValues)[number]
  )
}

export function getCardDisplayLabel(cardValue: string) {
  if (cardValue === 'nibbler') {
    return '?'
  }

  if (cardValue === 'ship') {
    return '∞'
  }

  if (cardValue === 'BIG') {
    return 'BIG'
  }

  if (cardValue === 'coffee') {
    return 'N/A'
  }

  return cardValue
}

export function getCardArtworkLabel(cardValue: string) {
  if (cardValue === 'nibbler') {
    return 'Nibbler'
  }

  if (cardValue === 'ship') {
    return 'Planet Express ship'
  }

  if (cardValue === 'BIG') {
    return 'Lrrr'
  }

  if (cardValue === 'coffee') {
    return 'Coffee'
  }

  return getCardDisplayLabel(cardValue)
}

export function getCardMeaningLabel(cardValue: string) {
  if (
    cardValue === 'nibbler' ||
    cardValue === 'ship' ||
    cardValue === 'BIG' ||
    cardValue === 'coffee'
  ) {
    return getCardDisplayLabel(cardValue)
  }

  return null
}
