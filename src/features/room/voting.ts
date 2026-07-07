import { getThemeConfig } from '../theme/registry'
import type { ThemeId } from '../theme/types'

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

export function getCardArtworkLabel(cardValue: string, themeId: ThemeId) {
  const labels = getThemeConfig(themeId).cardArtworkLabels

  if (cardValue === 'nibbler') {
    return labels.nibbler
  }

  if (cardValue === 'ship') {
    return labels.ship
  }

  if (cardValue === 'BIG') {
    return labels.BIG
  }

  if (cardValue === 'coffee') {
    return labels.coffee
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
