import { describe, expect, it } from 'vitest'
import { themeConfigs } from './registry'

describe('Toy Story theme registry', () => {
  it('uses ten distinct character SVGs for the roster', () => {
    const avatars = themeConfigs['toy-story'].avatars

    expect(avatars).toHaveLength(10)
    expect(new Set(avatars.map((avatar) => avatar.label)).size).toBe(10)
    expect(new Set(avatars.map((avatar) => avatar.portraitPath)).size).toBe(10)
    expect(
      avatars.every(
        (avatar) =>
          avatar.portraitPath.startsWith('/themes/toy-story/avatars/') &&
          avatar.portraitPath.endsWith('.svg')
      )
    ).toBe(true)
  })

  it('uses Buzz character art for the fly-by and infinity card', () => {
    const theme = themeConfigs['toy-story']
    const buzzPath = '/themes/toy-story/avatars/buzz-lightyear.svg'

    expect(theme.vehiclePath).toBe(buzzPath)
    expect(theme.vehicleSourcePath).toBe(buzzPath)
    expect(theme.cardArtworkPaths.ship).toBe(buzzPath)
  })

  it('uses local GIFs for every reveal reaction', () => {
    const reactions = Object.values(themeConfigs['toy-story'].roundReactions)
    const reactionSources = reactions.map((reaction) => reaction.src)

    expect(reactions.every((reaction) => reaction.mediaType === 'image')).toBe(
      true
    )
    expect(
      reactionSources.every(
        (source) =>
          source.startsWith('/themes/toy-story/reactions/') &&
          source.endsWith('.gif')
      )
    ).toBe(true)
    expect(new Set(reactionSources).size).toBeGreaterThanOrEqual(6)
  })

  it('does not reference the rejected placeholder assets', () => {
    const serializedTheme = JSON.stringify(themeConfigs['toy-story'])

    expect(serializedTheme).not.toContain('toy-story-trio')
    expect(serializedTheme).not.toContain('/cards/question-block')
    expect(serializedTheme).not.toContain('/cards/coffee-cup')
  })
})
