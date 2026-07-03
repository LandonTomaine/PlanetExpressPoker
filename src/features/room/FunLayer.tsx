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
  const shipMotion = isDeliveryEvent
    ? {
        rotate: [-1, 1, 0, 0, 0],
        x: ['-78vw', '0vw', '0vw', '0vw', '78vw'],
        y: [82, 92, 92, 92, 78],
      }
    : {
        rotate: [-1, 1, 0],
        x: ['-18vw', '42vw', '110vw'],
        y: [82, 94, 78],
      }
  const shipTransition = isDeliveryEvent
    ? {
        duration: 5.8,
        ease: 'easeInOut' as const,
        times: [0, 0.3, 0.46, 0.72, 1],
      }
    : {
        duration: 2.35,
        ease: 'easeInOut' as const,
        times: [0, 0.18, 0.82, 1],
      }
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
            {event?.mode === 'flyby' || event?.mode === 'delivery' ? (
              <motion.div
                initial={{
                  rotate: -1,
                  x: isDeliveryEvent ? '-78vw' : '-18vw',
                  y: 82,
                }}
                animate={shipMotion}
                transition={shipTransition}
                className={[
                  'absolute top-16 w-56 drop-shadow-[0_12px_24px_rgba(12,32,42,0.18)] will-change-transform sm:w-72',
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

            {reaction ? (
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
