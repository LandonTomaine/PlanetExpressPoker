import { getThemeConfig } from '../theme/registry'
import type { ThemeId } from '../theme/types'

export type RoomFunEvent = {
  caption: string
  mode:
    | 'celebration'
    | 'chaos'
    | 'delivery'
    | 'deliveryStorm'
    | 'flyby'
    | 'hypnotoad'
    | 'milestone'
  quote?: RoomFunQuote
}

export type RoomFunQuote = {
  avatarPath: string
  speaker: string
  text: string
}

export function getRevealQuotes(themeId: ThemeId) {
  return getThemeConfig(themeId).revealQuotes
}

export function getConsensusQuotes(themeId: ThemeId) {
  return getThemeConfig(themeId).consensusQuotes
}

export function getRevealCaption(themeId: ThemeId) {
  return getThemeConfig(themeId).revealCaption
}

export function getConsensusCaption(themeId: ThemeId) {
  return getThemeConfig(themeId).consensusCaption
}

export function getDeliveryCaption(themeId: ThemeId) {
  return getThemeConfig(themeId).deliveryCaption
}

export function getDeliveryStormCaption(themeId: ThemeId) {
  return getThemeConfig(themeId).deliveryStormCaption
}

export function getHypnotoadCaption(themeId: ThemeId) {
  return getThemeConfig(themeId).easterEggName
}

export function getMilestoneCaption(themeId: ThemeId) {
  return getThemeConfig(themeId).milestoneCaption
}
