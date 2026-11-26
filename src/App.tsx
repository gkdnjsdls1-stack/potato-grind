import OrientationGate from './OrientationGate'
import Stage from './Stage'
import Lab from './lab/Lab'
import { COLOR, STAGE } from './tokens'

// 0단계 확인용. 스테이지 정중앙에 색 박스 하나.
// 1단계에서 이 자리에 영업 화면 정지 이미지가 들어간다.

// 라우터는 아직 없다. /lab 하나뿐이라 주소만 본다.
// vercel.json이 모든 경로를 index.html로 돌리니 /lab도 새로고침이 된다.
const isLab = () => {
  if (typeof location === 'undefined') return false
  return (
    location.pathname.replace(/\/+$/, '') === '/lab' || location.hash === '#lab'
  )
}

export default function App() {
  return (
    <OrientationGate>
      <Stage>{isLab() ? <Lab /> : <Home />}</Stage>
    </OrientationGate>
  )
}

function Home() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: COLOR.cream,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: STAGE.width / 2 - 120,
          top: STAGE.height / 2 - 60,
          width: 240,
          height: 120,
          background: COLOR.dustyBlue,
          border: `4px solid ${COLOR.outline}`,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLOR.ink,
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        960 × 540
      </div>
      <a
        href="/lab"
        style={{
          position: 'absolute',
          left: STAGE.width / 2 - 90,
          top: STAGE.height / 2 + 84,
          width: 180,
          padding: '12px 0',
          textAlign: 'center',
          background: COLOR.beige,
          border: `4px solid ${COLOR.outline}`,
          borderRadius: 14,
          color: COLOR.ink,
          fontSize: 16,
          fontWeight: 700,
          textDecoration: 'none',
          fontFamily: 'inherit',
        }}
      >
        손동작 랩
      </a>
    </>
  )
}
