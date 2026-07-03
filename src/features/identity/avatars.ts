export type AvatarOption = {
  key: string
  label: string
  accentClassName: string
  portraitPath: string
}

export const avatarOptions: AvatarOption[] = [
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
  },
]

export const defaultAvatar = avatarOptions[0]

export function getAvatarOption(avatarKey: string) {
  return (
    avatarOptions.find((avatarOption) => avatarOption.key === avatarKey) ??
    defaultAvatar
  )
}
