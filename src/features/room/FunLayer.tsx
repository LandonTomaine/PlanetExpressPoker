import { AnimatePresence, motion } from 'motion/react'
import type { RoomFunEvent } from './fun'

type FunLayerProps = {
  event: null | RoomFunEvent
  reaction?: null | {
    mediaClassName: string
    mediaType: 'image' | 'video'
    src: string
  }
}

export function FunLayer({ event, reaction = null }: FunLayerProps) {
  const quoteDisplayDuration = event?.mode === 'celebration' ? 6.4 : 5.8
  const isDeliveryEvent = event?.mode === 'delivery'
  const isDeliveryStormEvent = event?.mode === 'deliveryStorm'
  const isHypnotoadEvent = event?.mode === 'hypnotoad'
  const isMilestoneEvent = event?.mode === 'milestone'
  const shipMotion = isDeliveryStormEvent
    ? {
        rotate: [4, 12, -9, 15, -14, 10, -7, -3],
        scale: [0.78, 0.94, 0.86, 1.02, 0.9, 0.98, 0.84, 0.76],
        scaleX: [1, 1, -1, 1, -1, -1, 1, 1],
        x: ['-38vw', '72vw', '18vw', '96vw', '42vw', '-24vw', '84vw', '112vw'],
        y: [72, 296, 126, 344, 68, 242, 148, 42],
      }
    : isDeliveryEvent
      ? {
          rotate: [-1, 1, 0, 0, 0],
          x: ['-78vw', '0vw', '0vw', '0vw', '78vw'],
          y: [82, 92, 92, 92, 78],
        }
      : isMilestoneEvent
        ? {
            rotate: [-8, 9, -13, 12, -6, 7, -3],
            scale: [0.74, 0.94, 0.82, 1.04, 0.9, 0.98, 0.78],
            x: ['-42vw', '22vw', '76vw', '12vw', '105vw', '38vw', '-38vw'],
            y: [58, 226, 82, 318, 150, 92, 258],
          }
        : {
            rotate: [-1, 1, 0],
            x: ['-18vw', '42vw', '110vw'],
            y: [82, 94, 78],
          }
  const shipTransition = isDeliveryStormEvent
    ? {
        duration: 9,
        ease: 'easeInOut' as const,
        times: [0, 0.13, 0.27, 0.42, 0.58, 0.72, 0.86, 1],
      }
    : isDeliveryEvent
      ? {
          duration: 5.8,
          ease: 'easeInOut' as const,
          times: [0, 0.3, 0.46, 0.72, 1],
        }
      : isMilestoneEvent
        ? {
            duration: 10,
            ease: 'easeInOut' as const,
            times: [0, 0.16, 0.32, 0.5, 0.68, 0.84, 1],
          }
        : {
            duration: 2.35,
            ease: 'easeInOut' as const,
            times: [0, 0.18, 0.82, 1],
          }
  const confetti = [
    { color: '#d42f26', delay: 0.15, left: '8%', rotate: 280, x: -80 },
    { color: '#f4d44f', delay: 0.45, left: '18%', rotate: -240, x: 72 },
    { color: '#1fa089', delay: 0.25, left: '29%', rotate: 320, x: -34 },
    { color: '#8fd6ff', delay: 0.65, left: '39%', rotate: -300, x: 96 },
    { color: '#ff7c48', delay: 0.35, left: '48%', rotate: 220, x: -110 },
    { color: '#d42f26', delay: 0.85, left: '58%', rotate: -260, x: 58 },
    { color: '#f4d44f', delay: 0.55, left: '68%', rotate: 310, x: -62 },
    { color: '#1fa089', delay: 0.75, left: '78%', rotate: -340, x: 88 },
    { color: '#8fd6ff', delay: 0.2, left: '88%', rotate: 270, x: -76 },
  ]
  const balloons = [
    { color: '#d42f26', delay: 0.3, left: '12%', x: -24 },
    { color: '#f4d44f', delay: 1.1, left: '33%', x: 36 },
    { color: '#1fa089', delay: 0.7, left: '62%', x: -34 },
    { color: '#8fd6ff', delay: 1.45, left: '84%', x: 28 },
  ]
  const packageDrops = [
    { delay: 2.08, drift: -34, rotate: -18, spread: -520, tumble: -420 },
    { delay: 2.22, drift: 18, rotate: 12, spread: -430, tumble: 380 },
    { delay: 2.36, drift: -22, rotate: -8, spread: -330, tumble: -520 },
    { delay: 2.5, drift: 28, rotate: 16, spread: -230, tumble: 470 },
    { delay: 2.64, drift: -10, rotate: -4, spread: -120, tumble: -390 },
    { delay: 2.78, drift: 12, rotate: 8, spread: 0, tumble: 450 },
    { delay: 2.92, drift: -24, rotate: -12, spread: 130, tumble: -470 },
    { delay: 3.06, drift: 22, rotate: 14, spread: 260, tumble: 520 },
    { delay: 3.2, drift: -16, rotate: -8, spread: 385, tumble: -430 },
    { delay: 3.34, drift: 30, rotate: 12, spread: 500, tumble: 560 },
  ]
  const shouldShowLayer = Boolean(event || reaction)

  return (
    <AnimatePresence>
      {shouldShowLayer ? (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          <motion.div
            key={
              reaction
                ? `reaction:${reaction.src}`
                : `${event?.mode}:${event?.caption}:${event?.quote?.text ?? ''}`
            }
            initial={isDeliveryEvent ? false : { opacity: 0 }}
            animate={isDeliveryEvent ? {} : { opacity: 1 }}
            exit={isDeliveryEvent ? {} : { opacity: 0 }}
            className="absolute inset-0"
          >
            {isMilestoneEvent ? (
              <>
                {confetti.map((piece, index) => (
                  <motion.span
                    key={`confetti:${index}`}
                    initial={{
                      opacity: 0,
                      rotate: 0,
                      x: 0,
                      y: -40,
                    }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      rotate: piece.rotate,
                      x: [0, piece.x * 0.35, piece.x],
                      y: ['-8vh', '48vh', '108vh'],
                    }}
                    transition={{
                      delay: piece.delay,
                      duration: 6.8,
                      ease: 'easeOut' as const,
                      times: [0, 0.14, 0.78, 1],
                    }}
                    className="absolute top-0 h-4 w-2 rounded-[3px] shadow-[0_6px_12px_rgba(12,32,42,0.14)]"
                    style={{
                      backgroundColor: piece.color,
                      left: piece.left,
                    }}
                  />
                ))}

                {balloons.map((balloon, index) => (
                  <motion.span
                    key={`balloon:${index}`}
                    initial={{
                      opacity: 0,
                      x: 0,
                      y: '105vh',
                    }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      x: [0, balloon.x, balloon.x * -0.45, balloon.x],
                      y: ['105vh', '62vh', '24vh', '-16vh'],
                    }}
                    transition={{
                      delay: balloon.delay,
                      duration: 7.4,
                      ease: 'easeInOut' as const,
                      times: [0, 0.18, 0.78, 1],
                    }}
                    className="absolute top-0 h-12 w-9 rounded-full border-2 border-white/70 shadow-[0_12px_24px_rgba(12,32,42,0.18)] after:absolute after:left-1/2 after:top-[43px] after:h-12 after:w-px after:-translate-x-1/2 after:bg-[rgba(20,38,51,0.28)] sm:h-14 sm:w-10 sm:after:top-[50px]"
                    style={{
                      backgroundColor: balloon.color,
                      left: balloon.left,
                    }}
                  />
                ))}
              </>
            ) : null}

            {event?.mode === 'flyby' ||
            event?.mode === 'delivery' ||
            isDeliveryStormEvent ||
            isMilestoneEvent ? (
              <motion.div
                initial={{
                  rotate: isDeliveryStormEvent ? -9 : -1,
                  scale: isMilestoneEvent || isDeliveryStormEvent ? 0.74 : 1,
                  scaleX: 1,
                  x: isDeliveryStormEvent
                    ? '-34vw'
                    : isDeliveryEvent
                      ? '-78vw'
                      : isMilestoneEvent
                        ? '-42vw'
                        : '-18vw',
                  y: isDeliveryStormEvent ? 42 : isMilestoneEvent ? 58 : 82,
                }}
                animate={shipMotion}
                transition={shipTransition}
                className={[
                  'absolute w-56 drop-shadow-[0_12px_24px_rgba(12,32,42,0.18)] will-change-transform sm:w-72',
                  isMilestoneEvent || isDeliveryStormEvent
                    ? 'top-0 sm:w-80'
                    : 'top-16',
                  isDeliveryEvent
                    ? 'left-[calc(50vw-7rem)] sm:left-[calc(50vw-9rem)]'
                    : 'left-0',
                ].join(' ')}
              >
                <img
                  src="/planet-express-ship.png"
                  alt="Planet Express ship"
                  className="w-full"
                />
              </motion.div>
            ) : null}

            {event?.mode === 'delivery'
              ? packageDrops.map((packageDrop, index) => (
                  <motion.img
                    key={`${event.caption}:${index}`}
                    src="/effects/icons8-package.png"
                    alt=""
                    initial={{
                      opacity: 0,
                      rotate: packageDrop.rotate,
                      scale: 0.74,
                      x: 0,
                      y: 178,
                    }}
                    animate={{
                      opacity: [0, 1, 1, 1],
                      rotate: [
                        packageDrop.rotate,
                        packageDrop.rotate + packageDrop.tumble * 0.24,
                        packageDrop.rotate + packageDrop.tumble * 0.62,
                        packageDrop.rotate + packageDrop.tumble,
                      ],
                      scale: [0.72, 0.88, 0.9, 0.84],
                      x: [
                        0,
                        packageDrop.drift,
                        packageDrop.spread * 0.48,
                        packageDrop.spread,
                      ],
                      y: [
                        'calc(0vh + 178px)',
                        'calc(34vh + 128px)',
                        'calc(72vh + 80px)',
                        'calc(100vh + 48px)',
                      ],
                    }}
                    transition={{
                      delay: packageDrop.delay,
                      duration: 4.6,
                      ease: 'linear' as const,
                      times: [0, 0.12, 0.58, 1],
                    }}
                    className="absolute left-[calc(50vw-1rem)] top-16 w-8 drop-shadow-[0_12px_24px_rgba(12,32,42,0.22)] will-change-transform sm:left-[calc(50vw-1.125rem)] sm:w-9"
                  />
                ))
              : null}

            {isHypnotoadEvent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.74, rotate: -4 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.74, 1.06, 1, 0.92],
                  rotate: [-4, 2, -1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 7,
                  ease: 'easeOut',
                  times: [0, 0.12, 0.9, 1],
                }}
                className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle,_rgba(201,240,232,0.36),_rgba(12,32,42,0.24)_50%,_rgba(12,32,42,0.44))]"
              >
                <img
                  src="/effects/hypnotoad.gif"
                  alt=""
                  className="w-[min(34rem,82vw)] rounded-[24px] border-4 border-[var(--pep-ink)] bg-black shadow-[0_30px_90px_rgba(12,32,42,0.44)]"
                />
              </motion.div>
            ) : reaction ? (
              <motion.div
                initial={{ opacity: 0, x: 140, y: 10, rotate: 3 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: [140, 0, 0, -24],
                  y: [10, 0, 0, -8],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 5,
                  ease: 'easeOut',
                  times: [0, 0.08, 0.9, 1],
                }}
                className="absolute bottom-10 right-8 rounded-[18px] border-2 border-[var(--pep-ink)] bg-white/96 p-2 shadow-[0_18px_42px_rgba(12,32,42,0.22)] will-change-transform"
              >
                {reaction.mediaType === 'image' ? (
                  <img
                    src={reaction.src}
                    alt=""
                    className={reaction.mediaClassName}
                  />
                ) : (
                  <video
                    src={reaction.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={reaction.mediaClassName}
                  />
                )}
              </motion.div>
            ) : event?.quote ? (
              <motion.div
                initial={{ opacity: 0, x: 140, y: 10, rotate: 3 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: [140, 0, 0, -24],
                  y: [10, 0, 0, -8],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: quoteDisplayDuration,
                  ease: 'easeOut',
                  times: [0, 0.08, 0.9, 1],
                }}
                className="absolute bottom-10 right-8 max-w-xs rounded-[16px] border border-[var(--pep-line)] bg-white/96 px-4 py-4 shadow-[0_16px_42px_rgba(12,32,42,0.16)] will-change-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,_#d7e2ea,_#ffffff)]">
                    <img
                      src={event.quote.avatarPath}
                      alt={event.quote.speaker}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                      {event.quote.speaker}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--pep-ink)]">
                  {event.quote.text}
                </p>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
