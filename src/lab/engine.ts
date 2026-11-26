// 손동작 랩 공용 엔진.
// 캔버스 한 장, rAF 한 개, 포인터 이벤트. 프레임마다 React를 다시 그리지 않는다.
// 한 프레임이라도 리렌더가 끼면 손맛이 먼저 죽는다.

export const CANVAS = { w: 740, h: 496 } as const

export type Readout = {
  status: string
  tone: 'idle' | 'good' | 'bad' | 'done'
  lines: Array<[string, string]>
  bars: Array<{ label: string; v: number; zone?: [number, number] }>
}

export interface Game {
  down(x: number, y: number, t: number): void
  move(x: number, y: number, t: number): void
  up(x: number, y: number, t: number): void
  step(dt: number, t: number): void
  draw(g: CanvasRenderingContext2D): void
  read(): Readout
  reset(): void
}

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const inv = (a: number, b: number, v: number) =>
  b === a ? 0 : clamp((v - a) / (b - a), 0, 1)

/** 두 16진 색을 t 비율로 섞는다. */
export function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const c = (sh: number) =>
    Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, clamp(t, 0, 1)))
  return `rgb(${c(16)},${c(8)},${c(0)})`
}

/** 모서리가 둥근 사각형 경로. roundRect가 없는 기기도 있어서 직접 그린다. */
export function rrect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const k = Math.min(r, w / 2, h / 2)
  g.beginPath()
  g.moveTo(x + k, y)
  g.lineTo(x + w - k, y)
  g.quadraticCurveTo(x + w, y, x + w, y + k)
  g.lineTo(x + w, y + h - k)
  g.quadraticCurveTo(x + w, y + h, x + w - k, y + h)
  g.lineTo(x + k, y + h)
  g.quadraticCurveTo(x, y + h, x, y + h - k)
  g.lineTo(x, y + k)
  g.quadraticCurveTo(x, y, x + k, y)
  g.closePath()
}

export function paint(
  g: CanvasRenderingContext2D,
  fill: string | null,
  line: string | null,
  lw = 4,
) {
  if (fill) {
    g.fillStyle = fill
    g.fill()
  }
  if (line) {
    g.strokeStyle = line
    g.lineWidth = lw
    g.lineJoin = 'round'
    g.lineCap = 'round'
    g.stroke()
  }
}

export function text(
  g: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  opts: { size?: number; color?: string; align?: CanvasTextAlign; weight?: number } = {},
) {
  const { size = 15, color = '#4D3328', align = 'center', weight = 500 } = opts
  g.font = `${weight} ${size}px system-ui, -apple-system, 'Noto Sans KR', sans-serif`
  g.textAlign = align
  g.textBaseline = 'middle'
  g.fillStyle = color
  g.fillText(s, x, y)
}

/** -PI..PI 로 줄인 각도 차. */
export function angleDelta(from: number, to: number) {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

/** 표본의 변동계수를 0..1 균일도로 바꾼다. 하나뿐이면 1. */
export function evenness(xs: number[]) {
  if (xs.length < 2) return 1
  const m = xs.reduce((s, v) => s + v, 0) / xs.length
  if (m === 0) return 0
  const sd = Math.sqrt(
    xs.reduce((s, v) => s + (v - m) * (v - m), 0) / xs.length,
  )
  return clamp(1 - sd / m, 0, 1)
}

export const pct = (v: number) => `${Math.round(v * 100)}%`
export const secs = (v: number) => `${v.toFixed(1)}초`
