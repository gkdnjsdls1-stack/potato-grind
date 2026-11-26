import { useEffect, useRef } from 'react'
import { CANVAS, type Game, type Readout } from './engine'

// 캔버스는 2배 해상도로 그려두고 CSS로 줄인다.
// Stage의 transform: scale()이 1보다 커지는 큰 화면에서도 선이 뭉개지지 않는다.
const SS = 2

export default function GameCanvas({
  game,
  onRead,
  onActive,
}: {
  game: Game
  onRead: (r: Readout) => void
  onActive: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const readCb = useRef(onRead)
  const activeCb = useRef(onActive)
  readCb.current = onRead
  activeCb.current = onActive

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const g = cv.getContext('2d')
    if (!g) return

    cv.width = CANVAS.w * SS
    cv.height = CANVAS.h * SS
    g.scale(SS, SS)

    const now = () => performance.now() / 1000
    const at = (e: PointerEvent): [number, number] => {
      const r = cv.getBoundingClientRect()
      return [
        ((e.clientX - r.left) / r.width) * CANVAS.w,
        ((e.clientY - r.top) / r.height) * CANVAS.h,
      ]
    }

    const onDown = (e: PointerEvent) => {
      e.preventDefault()
      try {
        cv.setPointerCapture(e.pointerId)
      } catch {
        /* 캡처가 막힌 기기는 그냥 넘어간다 */
      }
      const [x, y] = at(e)
      game.down(x, y, now())
      activeCb.current()
    }
    const onMove = (e: PointerEvent) => {
      const [x, y] = at(e)
      game.move(x, y, now())
    }
    const onUp = (e: PointerEvent) => {
      const [x, y] = at(e)
      game.up(x, y, now())
      activeCb.current()
    }

    cv.addEventListener('pointerdown', onDown)
    cv.addEventListener('pointermove', onMove)
    cv.addEventListener('pointerup', onUp)
    cv.addEventListener('pointercancel', onUp)

    let raf = 0
    let prev = now()
    let lastRead = 0
    const loop = () => {
      const t = now()
      const dt = Math.min(0.05, t - prev)
      prev = t
      game.step(dt, t)
      g.clearRect(0, 0, CANVAS.w, CANVAS.h)
      game.draw(g)
      if (t - lastRead > 0.1) {
        lastRead = t
        readCb.current(game.read())
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      cv.removeEventListener('pointerdown', onDown)
      cv.removeEventListener('pointermove', onMove)
      cv.removeEventListener('pointerup', onUp)
      cv.removeEventListener('pointercancel', onUp)
    }
  }, [game])

  return (
    <canvas
      ref={ref}
      style={{
        width: CANVAS.w,
        height: CANVAS.h,
        display: 'block',
        touchAction: 'none',
      }}
    />
  )
}
