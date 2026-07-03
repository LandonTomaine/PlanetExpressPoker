export type RoomFunEvent = {
  caption: string
  mode: 'celebration' | 'chaos' | 'delivery' | 'flyby'
  quote?: RoomFunQuote
}

export type RoomFunQuote = {
  avatarPath: string
  speaker: string
  text: string
}

const avatarPaths = {
  amy: '/avatars/icons8-amy.png',
  bender: '/avatars/icons8-bender.png',
  fry: '/avatars/icons8-fry.png',
  hermes: '/avatars/icons8-hermes.png',
  leela: '/avatars/icons8-captain-leela.png',
  lrrr: '/cards/icons8-lrrr.png',
  professor: '/avatars/icons8-professor.png',
  zapp: '/avatars/icons8-zapp.png',
  zoidberg: '/avatars/icons8-zoidberg.png',
} as const

export const revealQuotes: RoomFunQuote[] = [
  {
    avatarPath: avatarPaths.fry,
    speaker: 'Fry',
    text: 'Shut up and take my money!',
  },
  {
    avatarPath: avatarPaths.fry,
    speaker: 'Fry',
    text: 'You win again, gravity!',
  },
  {
    avatarPath: avatarPaths.bender,
    speaker: 'Bender',
    text: "I'm back, baby.",
  },
  {
    avatarPath: avatarPaths.bender,
    speaker: 'Bender',
    text: "It's not a warning light. It's a disco light.",
  },
  {
    avatarPath: avatarPaths.professor,
    speaker: 'Professor Farnsworth',
    text: 'To shreds, you say?',
  },
  {
    avatarPath: avatarPaths.leela,
    speaker: 'Leela',
    text: "Okay, if everyone's finished being stupid.",
  },
  {
    avatarPath: avatarPaths.leela,
    speaker: 'Leela',
    text: 'I intend to do as little dying as possible.',
  },
  {
    avatarPath: avatarPaths.zoidberg,
    speaker: 'Dr. Zoidberg',
    text: "Your music's bad and you should feel bad!",
  },
  {
    avatarPath: avatarPaths.hermes,
    speaker: 'Hermes Conrad',
    text: 'Sweet gorilla of Manila!',
  },
  {
    avatarPath: avatarPaths.amy,
    speaker: 'Amy Wong',
    text: 'Ew, pukeatronic!',
  },
  {
    avatarPath: avatarPaths.zapp,
    speaker: 'Zapp Brannigan',
    text: 'The spirit is willing.',
  },
  {
    avatarPath: avatarPaths.lrrr,
    speaker: 'Lrrr',
    text: "This is ancient Earth's most foolish program.",
  },
]

export const consensusQuotes: RoomFunQuote[] = [
  {
    avatarPath: avatarPaths.professor,
    speaker: 'Professor Farnsworth',
    text: 'Good news, everyone!',
  },
  {
    avatarPath: avatarPaths.professor,
    speaker: 'Professor Farnsworth',
    text: 'Sweet zombie Jesus!',
  },
  {
    avatarPath: avatarPaths.hermes,
    speaker: 'Hermes Conrad',
    text: 'Sweet lion of Zion!',
  },
  {
    avatarPath: avatarPaths.zoidberg,
    speaker: 'Dr. Zoidberg',
    text: 'Hooray!',
  },
  {
    avatarPath: avatarPaths.amy,
    speaker: 'Amy Wong',
    text: 'Aye-aye, captain.',
  },
  {
    avatarPath: avatarPaths.bender,
    speaker: 'Bender',
    text: "I'm back, baby.",
  },
  {
    avatarPath: avatarPaths.leela,
    speaker: 'Leela',
    text: "I'll be sitting here quietly.",
  },
]

export const revealCaption = 'Reveal'
export const consensusCaption = 'Consensus'
export const deliveryCaption = 'Delivery'
