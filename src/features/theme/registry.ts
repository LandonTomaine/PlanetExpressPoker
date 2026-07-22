import type { CSSProperties } from 'react'
import type {
  ThemeReactionDisplay,
  ThemeAvatar,
  ThemeConfig,
  ThemeFunQuote,
  ThemeId,
  ThemePalette,
} from './types'

const reactionMediaClassName =
  'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64'

const squareReactionMediaClassName = 'h-44 w-44 object-contain sm:h-56 sm:w-56'

const futuramaPalette: ThemePalette = {
  bg: '#d9f4ee',
  panel: 'rgba(255, 255, 255, 0.74)',
  panelStrong: '#c8efe5',
  line: 'rgba(18, 47, 56, 0.14)',
  lineStrong: 'rgba(18, 47, 56, 0.32)',
  ink: '#142633',
  inkSoft: '#526a73',
  accent: '#d42f26',
  accent2: '#179886',
  mint: '#71d5bf',
  yellow: '#f4d44f',
  sky: '#9edff1',
  fontBody: "'Trebuchet MS', 'Segoe UI', sans-serif",
  fontDisplay: "'Arial Narrow', 'Franklin Gothic Medium', sans-serif",
  rootBackground:
    'radial-gradient(circle at top left, rgba(244, 212, 79, 0.56), transparent 26%), radial-gradient(circle at 85% 12%, rgba(23, 152, 134, 0.22), transparent 20%), radial-gradient(circle at 70% 92%, rgba(212, 47, 38, 0.12), transparent 22%), linear-gradient(180deg, #c7eef0 0%, #e7fbf1 52%, #d6f1e9 100%)',
  bodyBackground:
    'linear-gradient(rgba(20, 38, 51, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 38, 51, 0.035) 1px, transparent 1px)',
}

const zootopiaPalette: ThemePalette = {
  bg: '#f5f1e3',
  panel: 'rgba(255, 255, 255, 0.78)',
  panelStrong: '#e7dcc0',
  line: 'rgba(73, 54, 34, 0.16)',
  lineStrong: 'rgba(73, 54, 34, 0.34)',
  ink: '#2c2016',
  inkSoft: '#675444',
  accent: '#f47b20',
  accent2: '#3d86c6',
  mint: '#f3ba6d',
  yellow: '#ffce57',
  sky: '#9dd1f1',
  fontBody: "'Gill Sans', 'Trebuchet MS', sans-serif",
  fontDisplay: "'Impact', 'Arial Black', sans-serif",
  rootBackground:
    'radial-gradient(circle at top left, rgba(255, 206, 87, 0.48), transparent 24%), radial-gradient(circle at 82% 14%, rgba(61, 134, 198, 0.18), transparent 18%), radial-gradient(circle at 74% 90%, rgba(244, 123, 32, 0.16), transparent 20%), linear-gradient(180deg, #d9ecf7 0%, #fff8ea 48%, #f2e3c7 100%)',
  bodyBackground:
    'linear-gradient(rgba(44, 32, 22, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 32, 22, 0.03) 1px, transparent 1px)',
}

const toyStoryPalette: ThemePalette = {
  bg: '#cfeeff',
  panel: 'rgba(255, 255, 255, 0.8)',
  panelStrong: '#f8e565',
  line: 'rgba(30, 91, 184, 0.2)',
  lineStrong: 'rgba(30, 91, 184, 0.42)',
  ink: '#173a72',
  inkSoft: '#4e6386',
  accent: '#d82f2f',
  accent2: '#1e5bb8',
  mint: '#83d67e',
  yellow: '#f7d938',
  sky: '#8ed6f4',
  fontBody: "'Trebuchet MS', 'Segoe UI', sans-serif",
  fontDisplay: "'Arial Black', 'Arial Narrow', sans-serif",
  rootBackground:
    'radial-gradient(circle at 12% 14%, rgba(255,255,255,0.94) 0 2%, transparent 2.4%), radial-gradient(circle at 28% 9%, rgba(255,255,255,0.88) 0 3%, transparent 3.4%), radial-gradient(circle at 78% 16%, rgba(255,255,255,0.9) 0 2.5%, transparent 2.9%), linear-gradient(180deg, #8ed6f4 0%, #dff6ff 56%, #f7e565 100%)',
  bodyBackground:
    'radial-gradient(circle at 18% 30%, rgba(30,91,184,0.07) 0 1px, transparent 1.5px), radial-gradient(circle at 75% 66%, rgba(216,47,47,0.07) 0 1px, transparent 1.5px)',
}

const futuramaAvatars: ThemeAvatar[] = [
  {
    key: 'captain-leela',
    label: 'Leela',
    accentClassName: 'from-cyan-200 via-sky-100 to-white',
    portraitPath: '/avatars/icons8-captain-leela.png',
  },
  {
    key: 'bender',
    label: 'Bender',
    accentClassName: 'from-slate-300 via-slate-100 to-white',
    portraitPath: '/avatars/icons8-bender.png',
  },
  {
    key: 'fry',
    label: 'Fry',
    accentClassName: 'from-amber-200 via-orange-100 to-white',
    portraitPath: '/avatars/icons8-fry.png',
  },
  {
    key: 'nibbler',
    label: 'Nibbler',
    accentClassName: 'from-sky-100 via-white to-yellow-100',
    portraitPath: '/avatars/icons8-nibbler.png',
  },
  {
    key: 'amy',
    label: 'Amy Wong',
    accentClassName: 'from-rose-200 via-pink-100 to-white',
    portraitPath: '/avatars/icons8-amy.png',
  },
  {
    key: 'professor',
    label: 'Professor Farnsworth',
    accentClassName: 'from-lime-200 via-emerald-100 to-white',
    portraitPath: '/avatars/icons8-professor.png',
  },
  {
    key: 'zapp',
    label: 'Zapp Brannigan',
    accentClassName: 'from-yellow-200 via-amber-100 to-white',
    portraitPath: '/avatars/icons8-zapp.png',
  },
  {
    key: 'hermes',
    label: 'Hermes Conrad',
    accentClassName: 'from-emerald-200 via-lime-100 to-white',
    portraitPath: '/avatars/icons8-hermes.png',
  },
  {
    key: 'zoidberg',
    label: 'Dr. Zoidberg',
    accentClassName: 'from-red-200 via-orange-100 to-white',
    portraitPath: '/avatars/icons8-zoidberg.png',
  },
  {
    key: 'lrrr',
    label: 'Lrrr',
    accentClassName: 'from-lime-300 via-yellow-100 to-white',
    portraitPath: '/cards/icons8-lrrr.png',
    portraitClassName: 'scale-[1.22]',
  },
]

const zootopiaAvatars: ThemeAvatar[] = [
  {
    key: 'captain-leela',
    label: 'Judy Hopps',
    accentClassName: 'from-sky-200 via-white to-indigo-100',
    portraitPath: '/themes/zootopia/avatars/judy-hopps.svg',
  },
  {
    key: 'bender',
    label: 'Nick Wilde',
    accentClassName: 'from-orange-200 via-amber-100 to-white',
    portraitPath: '/themes/zootopia/avatars/nick-wilde.svg',
  },
  {
    key: 'fry',
    label: 'Jerry Jumbeaux Jr.',
    accentClassName: 'from-cyan-200 via-blue-100 to-white',
    portraitPath: '/themes/zootopia/avatars/jerry-jumbeaux-jr.svg',
  },
  {
    key: 'nibbler',
    label: 'Flash',
    accentClassName: 'from-lime-200 via-emerald-100 to-white',
    portraitPath: '/themes/zootopia/avatars/flash.svg',
  },
  {
    key: 'amy',
    label: 'Gazelle',
    accentClassName: 'from-rose-200 via-pink-100 to-white',
    portraitPath: '/themes/zootopia/avatars/gazelle.svg',
  },
  {
    key: 'professor',
    label: 'Chief Bogo',
    accentClassName: 'from-slate-300 via-white to-zinc-100',
    portraitPath: '/themes/zootopia/avatars/chief-bogo.svg',
  },
  {
    key: 'zapp',
    label: 'Clawhauser',
    accentClassName: 'from-yellow-200 via-amber-100 to-white',
    portraitPath: '/themes/zootopia/avatars/clawhauser.svg',
  },
  {
    key: 'hermes',
    label: 'Mayor Lionheart',
    accentClassName: 'from-yellow-300 via-orange-100 to-white',
    portraitPath: '/themes/zootopia/avatars/mayor-lionheart.svg',
  },
  {
    key: 'zoidberg',
    label: 'Yax',
    accentClassName: 'from-purple-200 via-violet-100 to-white',
    portraitPath: '/themes/zootopia/avatars/yax.svg',
  },
  {
    key: 'lrrr',
    label: 'Mr. Big',
    accentClassName: 'from-stone-300 via-zinc-100 to-white',
    portraitPath: '/themes/zootopia/avatars/mr-big.svg',
  },
]

const toyStoryAvatars: ThemeAvatar[] = [
  {
    key: 'captain-leela',
    label: 'Buzz Lightyear',
    accentClassName: 'from-sky-200 via-white to-yellow-100',
    portraitPath: '/themes/toy-story/avatars/buzz-lightyear.svg',
    portraitClassName: 'object-contain scale-[1.35] translate-y-[8%]',
  },
  {
    key: 'bender',
    label: 'Woody',
    accentClassName: 'from-amber-200 via-yellow-100 to-white',
    portraitPath: '/themes/toy-story/avatars/woody.svg',
    portraitClassName: 'object-contain scale-[1.15]',
  },
  {
    key: 'fry',
    label: 'Jessie',
    accentClassName: 'from-red-200 via-yellow-100 to-white',
    portraitPath: '/themes/toy-story/avatars/jessie.svg',
    portraitClassName: 'object-contain scale-[1.08]',
  },
  {
    key: 'nibbler',
    label: 'Alien',
    accentClassName: 'from-lime-200 via-emerald-100 to-white',
    portraitPath: '/themes/toy-story/avatars/alien.svg',
    portraitClassName: 'object-contain scale-[1.12]',
  },
  {
    key: 'amy',
    label: 'Bo Peep',
    accentClassName: 'from-pink-200 via-sky-100 to-white',
    portraitPath: '/themes/toy-story/avatars/bo-peep.svg',
    portraitClassName: 'object-contain scale-[1.1]',
  },
  {
    key: 'professor',
    label: 'Rex',
    accentClassName: 'from-emerald-200 via-lime-100 to-white',
    portraitPath: '/themes/toy-story/avatars/rex.svg',
    portraitClassName: 'object-contain scale-[1.1]',
  },
  {
    key: 'zapp',
    label: 'Mr. Potato Head',
    accentClassName: 'from-orange-200 via-rose-100 to-white',
    portraitPath: '/themes/toy-story/avatars/mr-potato-head.svg',
    portraitClassName: 'object-contain scale-[1.1]',
  },
  {
    key: 'hermes',
    label: 'Slinky Dog',
    accentClassName: 'from-yellow-200 via-amber-100 to-white',
    portraitPath: '/themes/toy-story/avatars/slinky-dog.svg',
    portraitClassName: 'object-contain scale-[1.08]',
  },
  {
    key: 'zoidberg',
    label: 'Forky',
    accentClassName: 'from-red-100 via-white to-sky-100',
    portraitPath: '/themes/toy-story/avatars/forky.svg',
    portraitClassName: 'object-contain scale-[1.1]',
  },
  {
    key: 'lrrr',
    label: 'Bullseye',
    accentClassName: 'from-amber-300 via-orange-100 to-white',
    portraitPath: '/themes/toy-story/avatars/bullseye.svg',
    portraitClassName: 'object-contain scale-[1.08]',
  },
]

function buildQuote(
  avatarPath: string,
  speaker: string,
  text: string
): ThemeFunQuote {
  return { avatarPath, speaker, text }
}

const futuramaByKey = Object.fromEntries(
  futuramaAvatars.map((avatar) => [avatar.key, avatar])
) as Record<string, ThemeAvatar>

const zootopiaByKey = Object.fromEntries(
  zootopiaAvatars.map((avatar) => [avatar.key, avatar])
) as Record<string, ThemeAvatar>

const toyStoryByKey = Object.fromEntries(
  toyStoryAvatars.map((avatar) => [avatar.key, avatar])
) as Record<string, ThemeAvatar>

export const themeConfigs: Record<ThemeId, ThemeConfig> = {
  futurama: {
    id: 'futurama',
    label: 'Futurama',
    appTitle: 'Planet Express Poker',
    shortBrand: 'Planet Express',
    tagline: 'Realtime planning poker',
    logoAlt: 'Planet Express logo',
    logoPath: '/planet-express-logo.png',
    faviconPath: '/favicon.svg',
    vehicleLabel: 'Planet Express ship',
    vehiclePath: '/planet-express-ship.png',
    vehicleSourcePath: '/planet-express-ship.svg',
    packagePath: '/effects/icons8-package.png',
    homeEyebrow: 'Realtime estimation',
    homeDescription: 'Open a room, vote privately, reveal together.',
    roomDirectoryEyebrow: 'Room directory',
    roomDirectoryTitle: 'Open rooms',
    roomDirectoryDescription:
      'Browse active rooms, jump in quickly, and close owned rooms or use the admin PIN when needed.',
    crewLabel: 'Delivery crew',
    displayNamePlaceholder: 'Hermes',
    manualDeliveryLabel: 'Request Planet Express delivery',
    revealCaption: 'Reveal',
    consensusCaption: 'Consensus',
    deliveryCaption: 'Delivery',
    deliveryStormCaption: 'Ship stunt',
    easterEggName: 'Hypnotoad',
    easterEggRestingMessage: 'Hypnotoad is resting for now.',
    easterEggFailureMessage: 'Failed to summon Hypnotoad.',
    milestoneCaption: '100 rounds',
    cardArtworkLabels: {
      BIG: 'Lrrr',
      coffee: 'Coffee',
      nibbler: 'Nibbler',
      ship: 'Planet Express ship',
    },
    cardArtworkPaths: {
      BIG: '/cards/icons8-lrrr.png',
      coffee: '/cards/coffee-cup.svg',
      nibbler: '/cards/icons8-nibbler.png',
      ship: '/planet-express-ship.png',
    },
    avatars: futuramaAvatars,
    revealQuotes: [
      buildQuote(
        futuramaByKey.fry.portraitPath,
        'Fry',
        'Shut up and take my money!'
      ),
      buildQuote(
        futuramaByKey.fry.portraitPath,
        'Fry',
        'You win again, gravity!'
      ),
      buildQuote(
        futuramaByKey.bender.portraitPath,
        'Bender',
        "I'm back, baby."
      ),
      buildQuote(
        futuramaByKey.bender.portraitPath,
        'Bender',
        "It's not a warning light. It's a disco light."
      ),
      buildQuote(
        futuramaByKey.professor.portraitPath,
        'Professor Farnsworth',
        'To shreds, you say?'
      ),
      buildQuote(
        futuramaByKey['captain-leela'].portraitPath,
        'Leela',
        "Okay, if everyone's finished being stupid."
      ),
      buildQuote(
        futuramaByKey['captain-leela'].portraitPath,
        'Leela',
        'I intend to do as little dying as possible.'
      ),
      buildQuote(
        futuramaByKey.zoidberg.portraitPath,
        'Dr. Zoidberg',
        "Your music's bad and you should feel bad!"
      ),
      buildQuote(
        futuramaByKey.hermes.portraitPath,
        'Hermes Conrad',
        'Sweet gorilla of Manila!'
      ),
      buildQuote(
        futuramaByKey.amy.portraitPath,
        'Amy Wong',
        'Ew, pukeatronic!'
      ),
      buildQuote(
        futuramaByKey.zapp.portraitPath,
        'Zapp Brannigan',
        'The spirit is willing.'
      ),
      buildQuote(
        futuramaByKey.lrrr.portraitPath,
        'Lrrr',
        "This is ancient Earth's most foolish program."
      ),
    ],
    consensusQuotes: [
      buildQuote(
        futuramaByKey.professor.portraitPath,
        'Professor Farnsworth',
        'Good news, everyone!'
      ),
      buildQuote(
        futuramaByKey.professor.portraitPath,
        'Professor Farnsworth',
        'Sweet zombie Jesus!'
      ),
      buildQuote(
        futuramaByKey.hermes.portraitPath,
        'Hermes Conrad',
        'Sweet lion of Zion!'
      ),
      buildQuote(
        futuramaByKey.zoidberg.portraitPath,
        'Dr. Zoidberg',
        'Hooray!'
      ),
      buildQuote(
        futuramaByKey.amy.portraitPath,
        'Amy Wong',
        'Aye-aye, captain.'
      ),
      buildQuote(
        futuramaByKey.bender.portraitPath,
        'Bender',
        "I'm back, baby."
      ),
      buildQuote(
        futuramaByKey['captain-leela'].portraitPath,
        'Leela',
        "I'll be sitting here quietly."
      ),
    ],
    roundReactions: {
      coffee1: {
        mediaType: 'image',
        src: '/effects/coffee-1.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee2: {
        mediaType: 'image',
        src: '/effects/coffee-2.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee3: {
        mediaType: 'image',
        src: '/effects/coffee-3.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee4: {
        mediaType: 'image',
        src: '/effects/coffee-4.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus1: {
        mediaType: 'image',
        src: '/effects/hypnotoad.gif',
        mediaClassName: squareReactionMediaClassName,
      },
      consensus2: {
        mediaType: 'image',
        src: '/effects/consensus-2.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus3: {
        mediaType: 'image',
        src: '/effects/consensus-3.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus4: {
        mediaType: 'image',
        src: '/effects/consensus-4.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus5: {
        mediaType: 'image',
        src: '/effects/consensus-5.gif',
        mediaClassName: reactionMediaClassName,
      },
      nibblerQuestion: {
        mediaType: 'image',
        src: '/effects/nibbler-question.gif',
        mediaClassName: reactionMediaClassName,
      },
      skepticalFry: {
        mediaType: 'video',
        src: '/effects/skeptical-fry.webm',
        mediaClassName: reactionMediaClassName,
      },
      wideSpread1: {
        mediaType: 'image',
        src: '/effects/wide-spread-1.gif',
        mediaClassName: reactionMediaClassName,
      },
      wideSpread2: {
        mediaType: 'image',
        src: '/effects/wide-spread-2.gif',
        mediaClassName: reactionMediaClassName,
      },
    },
    palette: futuramaPalette,
  },
  'toy-story': {
    id: 'toy-story',
    label: 'Toy Story',
    appTitle: 'Toy Story Poker',
    shortBrand: 'Toy Story',
    tagline: 'Realtime planning poker',
    logoAlt: 'Toy Story Poker logo',
    logoPath: '/themes/toy-story/logo.svg',
    faviconPath: '/themes/toy-story/favicon.svg',
    vehicleLabel: 'Buzz Lightyear flying',
    vehiclePath: '/themes/toy-story/avatars/buzz-lightyear.svg',
    vehicleSourcePath: '/themes/toy-story/avatars/buzz-lightyear.svg',
    packagePath: '/themes/toy-story/avatars/alien.svg',
    homeEyebrow: 'Playroom estimation',
    homeDescription: 'Gather the toys, vote privately, and reveal together.',
    roomDirectoryEyebrow: 'Playroom board',
    roomDirectoryTitle: 'Open playrooms',
    roomDirectoryDescription:
      'Browse active rooms, join the toy box, and manage rooms you own.',
    crewLabel: 'Toy box roster',
    displayNamePlaceholder: 'Andy',
    manualDeliveryLabel: 'Call Buzz for a fly-by',
    revealCaption: 'Toy reveal',
    consensusCaption: 'Playtime consensus',
    deliveryCaption: 'Buzz fly-by',
    deliveryStormCaption: 'To infinity',
    easterEggName: 'The Claw',
    easterEggRestingMessage: 'The Claw is choosing another toy right now.',
    easterEggFailureMessage: 'The Claw could not reach the toy box.',
    milestoneCaption: '100 rounds',
    cardArtworkLabels: {
      BIG: 'Rex',
      coffee: 'Forky',
      nibbler: 'Alien',
      ship: 'Buzz Lightyear',
    },
    cardArtworkPaths: {
      BIG: '/themes/toy-story/avatars/rex.svg',
      coffee: '/themes/toy-story/avatars/forky.svg',
      nibbler: '/themes/toy-story/avatars/alien.svg',
      ship: '/themes/toy-story/avatars/buzz-lightyear.svg',
    },
    avatars: toyStoryAvatars,
    revealQuotes: [
      buildQuote(
        toyStoryByKey['captain-leela'].portraitPath,
        'Buzz Lightyear',
        'To infinity and beyond!'
      ),
      buildQuote(
        toyStoryByKey.bender.portraitPath,
        'Woody',
        "You've got a friend in me."
      ),
      buildQuote(toyStoryByKey.fry.portraitPath, 'Jessie', 'Yee-haw!'),
    ],
    consensusQuotes: [
      buildQuote(
        toyStoryByKey.bender.portraitPath,
        'Woody',
        "You've got a friend in me."
      ),
      buildQuote(
        toyStoryByKey['captain-leela'].portraitPath,
        'Buzz Lightyear',
        'To infinity and beyond!'
      ),
      buildQuote(toyStoryByKey.fry.portraitPath, 'Jessie', 'Yee-haw!'),
      buildQuote(
        toyStoryByKey.nibbler.portraitPath,
        'Alien',
        'The Claw has chosen!'
      ),
    ],
    roundReactions: {
      coffee1: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/forky-trash.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee2: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/forky-trash.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee3: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/forky-trash.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee4: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/forky-trash.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus1: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/consensus-handshake.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus2: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/consensus-dance.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus3: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/consensus-handshake.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus4: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/consensus-dance.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus5: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/consensus-handshake.gif',
        mediaClassName: reactionMediaClassName,
      },
      nibblerQuestion: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/rex-fear.gif',
        mediaClassName: reactionMediaClassName,
      },
      skepticalFry: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/rex-fear.gif',
        mediaClassName: reactionMediaClassName,
      },
      wideSpread1: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/wide-fight.gif',
        mediaClassName: reactionMediaClassName,
      },
      wideSpread2: {
        mediaType: 'image',
        src: '/themes/toy-story/reactions/wide-tumble.gif',
        mediaClassName: reactionMediaClassName,
      },
    },
    palette: toyStoryPalette,
  },
  zootopia: {
    id: 'zootopia',
    label: 'Zootopia',
    appTitle: 'Zootopia Poker',
    shortBrand: 'Zootopia',
    tagline: 'Realtime planning poker',
    logoAlt: 'Zootopia badge',
    logoPath: '/themes/zootopia/logo.svg',
    faviconPath: '/themes/zootopia/favicon.svg',
    vehicleLabel: 'ZPD cruiser',
    vehiclePath: '/themes/zootopia/cruiser.svg',
    vehicleSourcePath: '/themes/zootopia/cards/zpd-cruiser.svg',
    packagePath: '/themes/zootopia/parking-ticket.svg',
    homeEyebrow: 'Citywide estimation',
    homeDescription: 'Open a precinct, vote privately, and reveal together.',
    roomDirectoryEyebrow: 'Precinct board',
    roomDirectoryTitle: 'Open precincts',
    roomDirectoryDescription:
      'Browse active rooms, jump in fast, and close owned rooms or use the admin PIN when needed.',
    crewLabel: 'Patrol roster',
    displayNamePlaceholder: 'Judy',
    manualDeliveryLabel: 'Send Judy on patrol',
    revealCaption: 'Case reveal',
    consensusCaption: 'Case closed',
    deliveryCaption: 'Patrol',
    deliveryStormCaption: 'Case sprint',
    easterEggName: 'Flash protocol',
    easterEggRestingMessage: 'Flash is taking his time right now.',
    easterEggFailureMessage: 'Failed to trigger Flash protocol.',
    milestoneCaption: '100 rounds',
    cardArtworkLabels: {
      BIG: 'Mr. Big',
      coffee: 'Coffee',
      nibbler: 'Flash',
      ship: 'ZPD cruiser',
    },
    cardArtworkPaths: {
      BIG: '/themes/zootopia/cards/mr-big.svg',
      coffee: '/themes/zootopia/cards/coffee-cup.svg',
      nibbler: '/themes/zootopia/cards/flash-question.svg',
      ship: '/themes/zootopia/cards/zpd-cruiser.svg',
    },
    avatars: zootopiaAvatars,
    revealQuotes: [
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        "I don't know when to quit."
      ),
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        "It's your word against yours."
      ),
      buildQuote(
        zootopiaByKey.bender.portraitPath,
        'Nick Wilde',
        'Flash, Flash, 100-yard dash!'
      ),
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        "I'm not leaving."
      ),
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        'This is a crime scene.'
      ),
      buildQuote(
        zootopiaByKey.bender.portraitPath,
        'Nick Wilde',
        'We gotta go.'
      ),
      buildQuote(
        zootopiaByKey.zoidberg.portraitPath,
        'Yax',
        'Mind like a steel trap.'
      ),
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        'Sweet cheese and crackers.'
      ),
      buildQuote(
        zootopiaByKey.amy.portraitPath,
        'Gazelle',
        "I'm Gazelle. Welcome to Zootopia."
      ),
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        'Wow, this is a lot of great info.'
      ),
    ],
    consensusQuotes: [
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        'Anyone can be anything.'
      ),
      buildQuote(
        zootopiaByKey['captain-leela'].portraitPath,
        'Judy Hopps',
        'Make the world a better place.'
      ),
      buildQuote(
        zootopiaByKey.amy.portraitPath,
        'Gazelle',
        "I'm Gazelle. Welcome to Zootopia."
      ),
      buildQuote(
        zootopiaByKey.bender.portraitPath,
        'Nick Wilde',
        'Flash, Flash, 100-yard dash!'
      ),
      buildQuote(
        zootopiaByKey.amy.portraitPath,
        'Gazelle',
        'We celebrate our differences.'
      ),
    ],
    roundReactions: {
      coffee1: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/coffee-1.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee2: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/coffee-2.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee3: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/coffee-1.gif',
        mediaClassName: reactionMediaClassName,
      },
      coffee4: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/coffee-2.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus1: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/consensus-1.gif',
        mediaClassName: squareReactionMediaClassName,
      },
      consensus2: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/consensus-2.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus3: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/consensus-3.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus4: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/consensus-4.gif',
        mediaClassName: reactionMediaClassName,
      },
      consensus5: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/consensus-5.gif',
        mediaClassName: reactionMediaClassName,
      },
      nibblerQuestion: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/flash-question-1.gif',
        variants: [
          '/themes/zootopia/reactions/flash-question-1.gif',
          '/themes/zootopia/reactions/flash-question-2.gif',
          '/themes/zootopia/reactions/flash-question-3.gif',
          '/themes/zootopia/reactions/flash-question-4.gif',
        ],
        mediaClassName: reactionMediaClassName,
      },
      skepticalFry: {
        mediaType: 'video',
        src: '/themes/zootopia/reactions/mr-big-ice-em.webm',
        variants: [
          '/themes/zootopia/reactions/mr-big-ice-em.webm',
          '/themes/zootopia/reactions/mr-big-chair-turn.webm',
        ],
        mediaClassName: reactionMediaClassName,
      },
      wideSpread1: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/wide-spread-1.gif',
        mediaClassName: reactionMediaClassName,
      },
      wideSpread2: {
        mediaType: 'image',
        src: '/themes/zootopia/reactions/wide-spread-2.gif',
        mediaClassName: reactionMediaClassName,
      },
    },
    palette: zootopiaPalette,
  },
}

export const themeOptions = Object.values(themeConfigs).map((theme) => ({
  id: theme.id,
  label: theme.label,
}))

export const defaultThemeId: ThemeId = 'futurama'

export function getThemeConfig(themeId: ThemeId | string | null | undefined) {
  if (!themeId || !(themeId in themeConfigs)) {
    return themeConfigs[defaultThemeId]
  }

  return themeConfigs[themeId as ThemeId]
}

export function getThemeRoundReaction(
  themeId: ThemeId,
  reactionKind: string,
  roundNumber: number
): ThemeReactionDisplay {
  const reaction = getThemeConfig(themeId).roundReactions[reactionKind]

  if (!reaction) {
    return getThemeConfig(themeId).roundReactions.consensus1
  }

  if (!reaction.variants?.length) {
    return reaction
  }

  return {
    ...reaction,
    src: reaction.variants[roundNumber % reaction.variants.length],
  }
}

export function getThemeCardArtworkPath(themeId: ThemeId, cardValue: string) {
  const artworkPaths = getThemeConfig(themeId).cardArtworkPaths

  if (
    cardValue === 'BIG' ||
    cardValue === 'coffee' ||
    cardValue === 'nibbler' ||
    cardValue === 'ship'
  ) {
    return artworkPaths[cardValue]
  }

  return null
}

export function getThemeCssVars(themeId: ThemeId): CSSProperties {
  const palette = getThemeConfig(themeId).palette

  return {
    ['--pep-bg' as string]: palette.bg,
    ['--pep-panel' as string]: palette.panel,
    ['--pep-panel-strong' as string]: palette.panelStrong,
    ['--pep-line' as string]: palette.line,
    ['--pep-line-strong' as string]: palette.lineStrong,
    ['--pep-ink' as string]: palette.ink,
    ['--pep-ink-soft' as string]: palette.inkSoft,
    ['--pep-accent' as string]: palette.accent,
    ['--pep-accent-2' as string]: palette.accent2,
    ['--pep-mint' as string]: palette.mint,
    ['--pep-yellow' as string]: palette.yellow,
    ['--pep-sky' as string]: palette.sky,
    ['--pep-font-body' as string]: palette.fontBody,
    ['--pep-font-display' as string]: palette.fontDisplay,
    ['--pep-root-bg' as string]: palette.rootBackground,
    ['--pep-body-bg' as string]: palette.bodyBackground,
  } as CSSProperties
}
