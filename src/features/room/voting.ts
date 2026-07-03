export const numericCardValues = [
  '0',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '21',
] as const

export const fibonacciDeck = [
  ...numericCardValues,
  'ship',
  'BIG',
  'nibbler',
] as const

export type PokerCardValue = (typeof fibonacciDeck)[number]

export function isNumericCardValue(cardValue: string) {
  return numericCardValues.includes(
    cardValue as (typeof numericCardValues)[number]
  )
}

export function getCardDisplayLabel(cardValue: string) {
  if (cardValue === 'nibbler') {
    return 'Nibbler'
  }

  if (cardValue === 'ship') {
    return 'Planet Express'
  }

  if (cardValue === 'BIG') {
    return 'Lrrr'
  }

  return cardValue
}

export function getCardMeaningLabel(cardValue: string) {
  if (cardValue === 'nibbler') {
    return '?'
  }

  if (cardValue === 'ship') {
    return '∞'
  }

  if (cardValue === 'BIG') {
    return 'BIG'
  }

  return null
}
