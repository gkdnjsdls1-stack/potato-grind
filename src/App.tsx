import OrientationGate from './OrientationGate'
import Stage from './Stage'
import { COLOR, STAGE } from './tokens'

// 0단계 확인용. 스테이지 정중앙에 색 박스 하나.
// 1단계에서 이 자리에 영업 화면 정지 이미지가 들어간다.

export default function App() {
  return (
    <OrientationGate>
      <Stage>
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
      </Stage>
    </OrientationGate>
  )
}
