export type ThemeId = 'futurama' | 'zootopia'

export type ThemePalette = {
  bg: string
  panel: string
  panelStrong: string
  line: string
  lineStrong: string
  ink: string
  inkSoft: string
  accent: string
  accent2: string
  mint: string
  yellow: string
  sky: string
  fontBody: string
  fontDisplay: string
  rootBackground: string
  bodyBackground: string
}

export type ThemeAvatar = {
  key: string
  label: string
  accentClassName: string
  portraitPath: string
  portraitClassName?: string
}

export type ThemeReactionDisplay = {
  mediaType: 'image' | 'video'
  mediaClassName: string
  src: string
  variants?: string[]
}

export type ThemeFunQuote = {
  avatarPath: string
  speaker: string
  text: string
}

export type ThemeConfig = {
  id: ThemeId
  label: string
  appTitle: string
  shortBrand: string
  tagline: string
  logoAlt: string
  logoPath: string
  faviconPath: string
  vehicleLabel: string
  vehiclePath: string
  vehicleSourcePath: string
  packagePath: string
  homeEyebrow: string
  homeDescription: string
  roomDirectoryEyebrow: string
  roomDirectoryTitle: string
  roomDirectoryDescription: string
  crewLabel: string
  displayNamePlaceholder: string
  manualDeliveryLabel: string
  revealCaption: string
  consensusCaption: string
  deliveryCaption: string
  deliveryStormCaption: string
  easterEggName: string
  easterEggRestingMessage: string
  easterEggFailureMessage: string
  milestoneCaption: string
  cardArtworkLabels: {
    BIG: string
    coffee: string
    nibbler: string
    ship: string
  }
  cardArtworkPaths: {
    BIG: string
    coffee: string
    nibbler: string
    ship: string
  }
  avatars: ThemeAvatar[]
  revealQuotes: ThemeFunQuote[]
  consensusQuotes: ThemeFunQuote[]
  roundReactions: Record<string, ThemeReactionDisplay>
  palette: ThemePalette
}
