import { COLOR } from '../tokens'
import {
  CANVAS,
  angleDelta,
  clamp,
  mix,
  paint,
  pct,
  rrect,
  secs,
  text,
  type Game,
  type Readout,
} from './engine'

// 깎기 — 감자 가장자리를 따라 둥글게 문지른다.
// 각속도로만 깎인다. 멈춰 있거나 중심 쪽으로 긋는 움직임은 아무 일도 일으키지 않는다.

export type PeelCfg = { rate: number; band: number; brush: number }
export const peelDefaults: PeelCfg = { rate: 0.14, band: 0.45, brush: 1 }

const SEG = 72
const SEGW = (Math.PI * 2) / SEG
const CX = CANVAS.w / 2
const CY = CANVAS.h / 2 - 6
const RX = 116
const RY = 146

type Curl = {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  life: number
}

// 껍질 얼룩. 세그먼트마다 고정 위치라 매 프레임 흔들리지 않는다.
const SPECKS = Array.from({ length: 26 }, (_, i) => {
  const a = (i * 2.399) % (Math.PI * 2)
  const r = 0.35 + ((i * 0.37) % 0.55)
  return { a, r, s: 1.6 + ((i * 0.53) % 1.8) }
})

const TAU = Math.PI * 2
const wrap = (a: number) => ((a % TAU) + TAU) % TAU

export class PeelGame implements Game {
  private peeled = new Float32Array(SEG)
  private curls: Curl[] = []
  private held = false
  private prevA = 0
  private sweep = 0
  private started = 0
  private elapsed = 0
  private finished = 0
  private px = CX
  private py = CY
  private tangent = 0
  private hint = true
  private flash = 0

  constructor(private cfg: () => PeelCfg) {}

  reset() {
    this.peeled.fill(0)
    this.curls.length = 0
    this.held = false
    this.sweep = 0
    this.started = 0
    this.elapsed = 0
    this.finished = 0
    this.hint = true
    this.flash = 0
  }

  private get progress() {
    let s = 0
    for (let i = 0; i < SEG; i++) s += this.peeled[i]
    return s / SEG
  }

  private ang(x: number, y: number) {
    return Math.atan2((y - CY) / RY, (x - CX) / RX)
  }

  private rad(x: number, y: number) {
    return Math.hypot((x - CX) / RX, (y - CY) / RY)
  }

  down(x: number, y: number, t: number) {
    this.held = true
    this.prevA = this.ang(x, y)
    this.px = x
    this.py = y
    this.hint = false
    if (!this.started) this.started = t
  }

  move(x: number, y: number) {
    this.px = x
    this.py = y
    if (!this.held || this.finished) return
    const c = this.cfg()
    const a = this.ang(x, y)
    const d = angleDelta(this.prevA, a)
    const a0 = this.prevA
    this.prevA = a
    if (Math.abs(d) > 1.2) return // 손가락이 튄 경우

    const r = this.rad(x, y)
    if (r < 1 - c.band || r > 1 + c.band + 0.4) return

    this.sweep += Math.abs(d)
    this.tangent = a + Math.PI / 2

    // 지나간 각도 구간에 고르게 나눠 넣는다.
    // 이벤트가 몇 번 들어오든 한 바퀴당 세그먼트가 받는 양은 rate로 같다.
    const n = Math.max(1, Math.ceil(Math.abs(d) / (SEGW * 0.5)))
    const ds = Math.abs(d) / n
    const amt = (c.rate * ds) / SEGW
    for (let s = 0; s < n; s++) {
      const aa = a0 + (d * (s + 0.5)) / n
      const i0 = Math.round(wrap(aa) / SEGW)
      for (let k = -c.brush; k <= c.brush; k++) {
        const i = (i0 + k + SEG * 2) % SEG
        const w = c.brush ? 1 - Math.abs(k) / (c.brush + 1) : 1
        const before = this.peeled[i]
        const after = Math.min(1, before + amt * w)
        this.peeled[i] = after
        if (before < 1 && after >= 1) this.curl(i)
      }
    }
  }

  up() {
    this.held = false
  }

  private curl(i: number) {
    const a = i * SEGW
    this.curls.push({
      x: CX + Math.cos(a) * RX,
      y: CY + Math.sin(a) * RY,
      vx: Math.cos(a) * 42 + (Math.random() - 0.5) * 30,
      vy: Math.sin(a) * 30 - 40,
      rot: a,
      vr: (Math.random() - 0.5) * 7,
      life: 1,
    })
    if (this.curls.length > 90) this.curls.shift()
  }

  step(dt: number, t: number) {
    if (this.started && !this.finished) this.elapsed = t - this.started
    if (this.flash > 0) this.flash -= dt
    for (const c of this.curls) {
      c.vy += 620 * dt
      c.x += c.vx * dt
      c.y += c.vy * dt
      c.rot += c.vr * dt
      if (c.y > CANVAS.h + 30) c.life = 0
    }
    this.curls = this.curls.filter((c) => c.life > 0)
    if (!this.finished && this.progress > 0.995) {
      this.finished = t
      this.flash = 0.6
    }
  }

  draw(g: CanvasRenderingContext2D) {
    const c = this.cfg()

    // 도마
    rrect(g, CX - 212, CY - 214, 424, 428, 26)
    paint(g, COLOR.beige, COLOR.outline, 4)

    // 바닥 그림자
    g.beginPath()
    g.ellipse(CX, CY + RY * 0.94, RX * 0.84, 15, 0, 0, TAU)
    g.fillStyle = 'rgba(86,53,41,0.13)'
    g.fill()

    // 속살
    g.beginPath()
    g.ellipse(CX, CY, RX, RY, 0, 0, TAU)
    paint(g, COLOR.potatoFlesh, null)

    // 남은 껍질. 세그먼트마다 색이 속살 쪽으로 녹는다.
    g.save()
    g.beginPath()
    g.ellipse(CX, CY, RX, RY, 0, 0, TAU)
    g.clip()
    for (let i = 0; i < SEG; i++) {
      const p = this.peeled[i]
      if (p >= 0.999) continue
      const a0 = i * SEGW - SEGW * 0.04
      const a1 = (i + 1) * SEGW + SEGW * 0.04
      g.beginPath()
      g.moveTo(CX, CY)
      g.lineTo(CX + Math.cos(a0) * RX * 1.1, CY + Math.sin(a0) * RY * 1.1)
      g.lineTo(CX + Math.cos(a1) * RX * 1.1, CY + Math.sin(a1) * RY * 1.1)
      g.closePath()
      g.fillStyle = mix(COLOR.potato, COLOR.potatoFlesh, p)
      g.fill()
    }
    // 껍질 얼룩
    for (const s of SPECKS) {
      const i = Math.floor(wrap(s.a) / SEGW)
      if (this.peeled[i] > 0.4) continue
      g.beginPath()
      g.ellipse(
        CX + Math.cos(s.a) * RX * s.r,
        CY + Math.sin(s.a) * RY * s.r,
        s.s,
        s.s * 0.8,
        s.a,
        0,
        TAU,
      )
      g.globalAlpha = 1 - this.peeled[i] / 0.4
      g.fillStyle = COLOR.potatoDark
      g.fill()
      g.globalAlpha = 1
    }
    g.restore()

    // 윤곽선
    g.beginPath()
    g.ellipse(CX, CY, RX, RY, 0, 0, TAU)
    paint(g, null, COLOR.outline, 5)

    // 유효 반경 안내 — 손을 대기 전까지만
    if (this.hint) {
      g.save()
      g.setLineDash([9, 9])
      g.beginPath()
      g.ellipse(CX, CY, RX * (1 + c.band * 0.5), RY * (1 + c.band * 0.5), 0, 0, TAU)
      paint(g, null, COLOR.sage, 3)
      g.restore()
      text(g, '가장자리를 따라 둥글게 문질러요', CX, CY + RY + 50, {
        size: 16,
        color: COLOR.outline,
      })
    }

    // 떨어진 껍질
    for (const cu of this.curls) {
      g.save()
      g.translate(cu.x, cu.y)
      g.rotate(cu.rot)
      rrect(g, -13, -4, 26, 8, 4)
      paint(g, COLOR.potato, COLOR.outline, 2)
      g.restore()
    }

    // 감자칼
    if (this.held) {
      g.save()
      g.translate(this.px, this.py)
      g.rotate(this.tangent)
      rrect(g, -9, -23, 18, 46, 8)
      paint(g, COLOR.dustyBlue, COLOR.outline, 3)
      g.beginPath()
      g.moveTo(-5, -9)
      g.lineTo(5, -9)
      paint(g, null, COLOR.outline, 2.5)
      g.restore()
    }

    if (this.finished) {
      const a = clamp(this.flash / 0.6, 0, 1)
      if (a > 0) {
        g.globalAlpha = 0.3 * a
        g.beginPath()
        g.ellipse(CX, CY, RX + 16, RY + 16, 0, 0, TAU)
        g.fillStyle = '#ffffff'
        g.fill()
        g.globalAlpha = 1
      }
      text(g, '다 깎았다', CX, CY + RY + 50, {
        size: 20,
        weight: 700,
        color: COLOR.outline,
      })
    }
  }

  read(): Readout {
    const p = this.progress
    return {
      status: this.finished
        ? '완료'
        : this.held
          ? '깎는 중'
          : this.started
            ? '멈춤'
            : '시작 전',
      tone: this.finished ? 'done' : this.held ? 'good' : 'idle',
      lines: [
        ['돌린 바퀴', `${(this.sweep / TAU).toFixed(2)}바퀴`],
        ['걸린 시간', secs(this.elapsed)],
        ['남은 껍질', pct(1 - p)],
      ],
      bars: [{ label: '깎인 정도', v: p }],
    }
  }
}
