import { COLOR } from '../tokens'
import {
  CANVAS,
  clamp,
  evenness,
  paint,
  pct,
  rrect,
  type Game,
  type Readout,
  text,
} from './engine'

// 갈기 — 강판 위를 위아래로 문지른다.
// 갈리는 건 내려긋는 동안만. 올리는 건 되돌리는 동작이라 저절로 리듬이 생긴다.
// 점수는 양이 아니라 속도의 일정함이다. 미친 듯이 빨라도, 느릿해도 효율이 떨어진다.

export type GrateCfg = {
  vMin: number
  vMax: number
  yield: number
  target: number
}
export const grateDefaults: GrateCfg = {
  vMin: 260,
  vMax: 900,
  yield: 1,
  target: 100,
}

const GX = CANVAS.w / 2 - 36
const GW = 150
const GTOP = 92
const GBOT = 376
const PILE = { x: CANVAS.w / 2 - 110, y: 430, w: 230 }

type Shred = { x: number; y: number; vx: number; vy: number; rot: number; rest: boolean }

export class GrateGame implements Game {
  private held = false
  private y = GTOP - 30
  private px = GX + GW / 2
  private amount = 0
  private speed = 0
  private dir = 0
  private strokeStart = 0
  private strokes: number[] = []
  private shreds: Shred[] = []
  private quality = 1
  private started = 0
  private elapsed = 0
  private finished = 0
  private hint = true

  constructor(private cfg: () => GrateCfg) {}

  reset() {
    this.held = false
    this.y = GTOP - 30
    this.amount = 0
    this.speed = 0
    this.dir = 0
    this.strokes = []
    this.shreds = []
    this.quality = 1
    this.started = 0
    this.elapsed = 0
    this.finished = 0
    this.hint = true
  }

  down(x: number, y: number, t: number) {
    this.held = true
    this.px = x
    this.y = clamp(y, GTOP - 60, GBOT + 60)
    this.strokeStart = t
    this.dir = 0
    this.hint = false
    if (!this.started) this.started = t
  }

  move(x: number, y: number, t: number) {
    this.px = x
    if (!this.held || this.finished) return
    const c = this.cfg()
    const ny = clamp(y, GTOP - 60, GBOT + 60)
    const dy = ny - this.y
    this.y = ny
    if (dy === 0) return

    const d = Math.sign(dy)
    if (this.dir !== 0 && d !== this.dir) {
      // 방향이 바뀌면 한 획이 끝난 것
      const dur = t - this.strokeStart
      if (dur > 0.05 && dur < 3) this.strokes.push(dur)
      if (this.strokes.length > 12) this.strokes.shift()
      this.strokeStart = t
    }
    this.dir = d

    // 속도는 최근 값을 끌고 간다. 프레임 하나에 바늘이 튀지 않게.
    const dt = Math.max(1 / 240, t - (this.lastT || t))
    this.lastT = t
    this.speed = this.speed * 0.72 + (Math.abs(dy) / dt) * 0.28

    // 속도 품질 — 목표 구간 안이면 1, 밖으로 나갈수록 떨어진다
    const s = this.speed
    this.quality =
      s < c.vMin
        ? clamp(0.3 + (s / c.vMin) * 0.7, 0.2, 1)
        : s > c.vMax
          ? clamp(1 - (s - c.vMax) / (c.vMax * 1.3), 0.25, 1)
          : 1

    const onPlate = this.y > GTOP - 24 && this.y < GBOT + 24
    if (d > 0 && onPlate) {
      const gained = Math.abs(dy) * 0.085 * c.yield * this.quality
      this.amount += gained
      if (Math.random() < gained * 0.7) this.shred()
    }
  }

  private lastT = 0

  up() {
    this.held = false
    this.dir = 0
  }

  // 간 감자는 손 밑이 아니라 강판 아래 끝에서 떨어져 나온다.
  private shred() {
    this.shreds.push({
      x: GX + 14 + Math.random() * (GW - 28),
      y: GBOT - 4,
      vx: (Math.random() - 0.5) * 90,
      vy: 40 + Math.random() * 90,
      rot: Math.random() * Math.PI,
      rest: false,
    })
    if (this.shreds.length > 160) this.shreds.shift()
  }

  step(dt: number, t: number) {
    if (this.started && !this.finished) this.elapsed = t - this.started
    if (!this.held) this.speed *= Math.pow(0.02, dt)
    const c = this.cfg()
    // 더미 표면은 둥글다. 떨어진 조각은 그 곡면 위에 얹힌다.
    const ph = this.pileH
    const surface = (x: number) => {
      const u = clamp((x - (PILE.x + PILE.w / 2)) / (PILE.w / 2), -1, 1)
      return PILE.y - ph * Math.sqrt(1 - u * u) * 0.52
    }
    for (const s of this.shreds) {
      if (s.rest) continue
      s.vy += 1100 * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.x = clamp(s.x, PILE.x + 12, PILE.x + PILE.w - 12)
      const top = surface(s.x)
      if (s.y >= top) {
        s.y = top - 1
        s.rest = true
      }
    }
    if (!this.finished && this.amount >= c.target) this.finished = t
  }

  private get pileH() {
    const c = this.cfg()
    return clamp(this.amount / c.target, 0, 1) * 54
  }

  draw(g: CanvasRenderingContext2D) {
    const c = this.cfg()

    // 강판
    rrect(g, GX, GTOP, GW, GBOT - GTOP, 18)
    paint(g, COLOR.dustyBlue, COLOR.outline, 4.5)
    // 손잡이
    rrect(g, GX + GW / 2 - 26, GTOP - 46, 52, 54, 16)
    paint(g, COLOR.earthDark, COLOR.outline, 4)

    // 구멍
    g.save()
    rrect(g, GX + 7, GTOP + 7, GW - 14, GBOT - GTOP - 14, 12)
    g.clip()
    for (let row = 0; row * 24 < GBOT - GTOP; row++) {
      for (let col = 0; col < 5; col++) {
        const hx = GX + 20 + col * 28 + (row % 2 ? 14 : 0)
        const hy = GTOP + 22 + row * 24
        if (hy > GBOT - 14) continue
        g.beginPath()
        g.moveTo(hx - 7, hy + 4)
        g.lineTo(hx, hy - 5)
        g.lineTo(hx + 7, hy + 4)
        paint(g, null, COLOR.outline, 2.2)
      }
    }
    g.restore()

    // 간 감자 더미
    const ph = this.pileH
    if (ph > 1) {
      g.beginPath()
      g.ellipse(PILE.x + PILE.w / 2, PILE.y, PILE.w / 2, ph * 0.52, 0, Math.PI, Math.PI * 2)
      g.lineTo(PILE.x, PILE.y)
      g.closePath()
      paint(g, COLOR.potatoFlesh, COLOR.outline, 4)
    }
    for (const s of this.shreds) {
      g.save()
      g.translate(s.x, s.y)
      g.rotate(s.rot)
      rrect(g, -7, -2, 14, 4, 2)
      paint(g, COLOR.potatoFlesh, COLOR.outline, 1.8)
      g.restore()
    }

    // 손에 쥔 감자 덩이
    const hy = clamp(this.y, GTOP - 50, GBOT + 40)
    const hx = this.held ? clamp(this.px, GX + 20, GX + GW - 20) : GX + GW / 2
    g.beginPath()
    g.ellipse(hx, hy, 52, 40, 0, 0, Math.PI * 2)
    paint(g, COLOR.potato, COLOR.outline, 4.5)
    if (this.held && this.dir > 0) {
      g.save()
      g.globalAlpha = 0.5
      for (let i = 1; i <= 3; i++) {
        g.beginPath()
        g.moveTo(hx - 30 + i * 15, hy - 52)
        g.lineTo(hx - 30 + i * 15, hy - 74)
        paint(g, null, COLOR.sage, 3)
      }
      g.restore()
    }

    // 속도 바늘
    const gaugeX = 104
    const gy0 = 120
    const gy1 = 400
    rrect(g, gaugeX - 17, gy0, 34, gy1 - gy0, 17)
    paint(g, COLOR.beige, COLOR.outline, 3.5)
    const toY = (v: number) => gy1 - clamp(v / (c.vMax * 1.6), 0, 1) * (gy1 - gy0)
    g.globalAlpha = 0.55
    g.fillStyle = COLOR.sage
    g.fillRect(gaugeX - 14, toY(c.vMax), 28, toY(c.vMin) - toY(c.vMax))
    g.globalAlpha = 1
    const ny = toY(this.speed)
    g.beginPath()
    g.moveTo(gaugeX - 22, ny)
    g.lineTo(gaugeX + 22, ny)
    paint(g, null, this.quality > 0.9 ? COLOR.outline : COLOR.terracotta, 5)
    text(g, '속도', gaugeX, gy0 - 20, { size: 14, color: COLOR.outline })

    if (this.hint) {
      text(g, '강판 위를 위아래로 문질러요', CANVAS.w / 2 + 30, GBOT + 86, {
        size: 16,
        color: COLOR.outline,
      })
    }
    if (this.finished) {
      text(g, '다 갈았다', CANVAS.w / 2 + 30, GBOT + 86, {
        size: 20,
        weight: 700,
        color: COLOR.outline,
      })
    }
  }

  read(): Readout {
    const c = this.cfg()
    const steady = evenness(this.strokes)
    const inBand = this.speed >= c.vMin && this.speed <= c.vMax
    return {
      status: this.finished
        ? '완료'
        : !this.held
          ? this.started
            ? '멈춤'
            : '시작 전'
          : inBand
            ? '좋은 속도'
            : this.speed < c.vMin
              ? '너무 느림'
              : '너무 빠름',
      tone: this.finished
        ? 'done'
        : !this.held
          ? 'idle'
          : inBand
            ? 'good'
            : 'bad',
      lines: [
        ['획', `${this.strokes.length}획`],
        ['속도', `${Math.round(this.speed)}px/s`],
        ['효율', pct(this.quality)],
        ['걸린 시간', `${this.elapsed.toFixed(1)}초`],
      ],
      bars: [
        { label: '간 양', v: clamp(this.amount / c.target, 0, 1) },
        { label: `리듬 일정함 ${pct(steady)}`, v: steady },
      ],
    }
  }
}
