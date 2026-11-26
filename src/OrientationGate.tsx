import { useEffect, useState, type ReactNode } from 'react'
import { COLOR } from './tokens'

// 세로로 들면 가로로 돌려 달라고 덮는다.
// 데스크톱 창은 세로로 좁아도 모바일이 아니므로 통과시킨다.

const isCoarse = () =>
  typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

export default function OrientationGate({ children }: { children: ReactNode }) {
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    const check = () =>
      setPortrait(isCoarse() && window.innerHeight > window.innerWidth)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (!portrait) return <>{children}</>

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: COLOR.cream,
        color: COLOR.ink,
      }}
    >
      <div
        style={{
          width: 56,
          height: 92,
          border: `4px solid ${COLOR.outline}`,
          borderRadius: 10,
          animation: 'none',
        }}
      />
      <p style={{ fontSize: 18, fontWeight: 500 }}>가로로 돌려 주세요</p>
    </div>
  )
}
