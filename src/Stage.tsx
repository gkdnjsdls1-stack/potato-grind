import { useEffect, useRef, useState, type ReactNode } from 'react'
import { STAGE } from './tokens'

// 모든 좌표는 960x540 안에서 잡는다. 화면에는 transform: scale() 한 번만 건다.
// 기종별 레이아웃 깨짐은 전부 여기서 흡수된다.

export default function Stage({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = outer.current
    if (!el) return

    const fit = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      setScale(Math.min(w / STAGE.width, h / STAGE.height))
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('orientationchange', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', fit)
    }
  }, [])

  return (
    <div
      ref={outer}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: STAGE.width,
          height: STAGE.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flex: '0 0 auto',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}
