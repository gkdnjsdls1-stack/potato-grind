import { COLOR } from '../tokens'
import {
  CANVAS,
  clamp,
  evenness,
  paint,
  pct,
  rrect,
  text,
  type Game,
  type Readout,
} from './engine'

// 썰기 — 안내선 위를 아래로 긋는다.
// 판정은 두 가지다. 긋는 위치(두께)와 긋는 간격(리듬).
// 칼이 감자 중심선을 지나는 순간 바로 잘린다. 손을 떼기를 기다리지 않는다.

export type SliceCfg = {
  step: number
  perfect: number
  good: number
  rhythmTol: number
}
export const sliceDefaults: SliceCfg = {
  step: 44,
  perfect: 7,
  good: 18,
  rhythmTol: 0.3,
}

const CY = 250
const HH = 56
const L0 = 300
const R0 = 660
const BOARD = { x: 70, y: CY - 150, w: 600, h: 300 }

type Slab = {
  x: number
  y: number
  w: number
  vx: number
  vy: number
  rot: number
  vr: number
  rest: boolean
}
type Spark = { x: number; y: number; life: number }

const GRADES = ['완벽', '좋음', '삐뚤', '헛손질'] as const
type Grade = (typeof GRADES)[number]

export class SliceGame implements Game {
  private left = L0
  private slabs: Slab[] = []
  private sparks: Spark[] = []
  private widths: number[] = []
  private gaps: number[] = []
  private grades: Grade[] = []
  private combo = 0
  private bestCombo = 0
  private lastCut = 0
  private held = false
  private px = 0
  private py = 0
  private prevY = 0
  private travel = 0
  private lastGrade: Grade | null = null
  private gradeAt = 0
  private now = 0
  private hint = true

  constructor(private cfg: () => SliceCfg) {}

  reset() {
    this.left = L0
    this.slabs.length = 0
    this.sparks.length = 0
    this.widths = []
    this.gaps = []
    this.grades = []
    this.combo = 0
    this.bestCombo = 0
    this.lastCut = 0
    this.held = false
    this.travel = 0
    this.lastGrade = null
    this.hint = true
  }

  private get guide() {
    return Math.min(this.left + this.cfg().step, R0)
  }

  private get finished() {
    return this.left >= R0 - 8
  }

  down(x: number, y: number) {
    this.held = true
    this.px = x
    this.py = y
    this.prevY = y
    this.travel = 0
    this.hint = false
  }

  move(x: number, y: number, t: number) {
    this.px = x
    this.py = y
    if (!this.held || this.finished) return
    const dy = y - this.prevY
    this.travel += Math.max(0, dy)
    // 위에서 아래로 중심선을 지나는 순간이 칼이 들어간 순간이다
    if (this.prevY < CY && y >= CY && this.travel > 24) this.cut(x, t)
    this.prevY = y
  }

  up() {
    this.held = false
  }

  private cut(x: number, t: number) {
    const c = this.cfg()
    const target = this.guide
    const d = Math.abs(x - target)

    if (x <= this.left + 4 || x >= R0 + 10) {
      this.lastGrade = '헛손질'
      this.gradeAt = this.now
      this.combo = 0
      return
    }

    const grade: Grade = d <= c.perfect ? '완벽' : d <= c.good ? '좋음' : '삐뚤'
    const cx = Math.min(x, R0)
    const w = cx - this.left

    this.widths.push(w)
    this.grades.push(grade)
    this.lastGrade = grade
    this.gradeAt = this.now

    // 리듬은 간격이 아니라 간격의 일정함을 본다
    if (this.lastCut) {
      const gap = t - this.lastCut
      const prev = this.gaps[this.gaps.length - 1]
      this.gaps.push(gap)
      const steady =
        prev === undefined || Math.abs(gap - prev) / prev <= c.rhythmTol
      if (steady && grade !== '삐뚤') this.combo++
      else this.combo = 0
    } else {
      this.combo = grade === '삐뚤' ? 0 : 1
    }
    this.bestCombo = Math.max(this.bestCombo, this.combo)
    this.lastCut = t

    this.slabs.push({
      x: this.left,
      y: CY,
      w,
      vx: -180 - Math.random() * 90,
      vy: -120 - Math.random() * 60,
      rot: 0,
      vr: (Math.random() - 0.5) * 3,
      rest: false,
    })
    for (let i = 0; i < 7; i++) {
      this.sparks.push({
        x: cx + (Math.random() - 0.5) * 10,
        y: CY + (Math.random() - 0.5) * HH * 1.6,
        life: 1,
      })
    }
    this.left = cx
  }

  step(dt: number, t: number) {
    this.now = t
    for (const s of this.slabs) {
      if (s.rest) continue
      s.vy += 1400 * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.rot += s.vr * dt
      const floor = CY + 118
      if (s.y >= floor) {
        s.y = floor
        s.rest = true
        s.rot = s.rot * 0.25
      }
      if (s.x < -200) s.rest = true
    }
    for (const sp of this.sparks) sp.life -= dt * 3.2
    this.sparks = this.sparks.filter((s) => s.life > 0)
  }

  private potato(
    g: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    rrect(g, x, y - h / 2, w, h, r)
  }

  draw(g: CanvasRenderingContext2D) {
    const c = this.cfg()

    // 도마
    rrect(g, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 24)
    paint(g, COLOR.beige, COLOR.outline, 4)
    g.save()
    g.globalAlpha = 0.35
    for (let i = 1; i < 5; i++) {
      g.beginPath()
      g.moveTo(BOARD.x + 18, BOARD.y + (BOARD.h / 5) * i)
      g.lineTo(BOARD.x + BOARD.w - 18, BOARD.y + (BOARD.h / 5) * i)
      paint(g, null, COLOR.potato, 2)
    }
    g.restore()

    // 썰린 조각
    for (const s of this.slabs) {
      g.save()
      g.translate(s.x + s.w / 2, s.y)
      g.rotate(s.rot)
      this.potato(g, -s.w / 2, 0, s.w, HH * 2 * 0.94, Math.min(10, s.w / 2))
      paint(g, COLOR.potatoFlesh, COLOR.outline, 3)
      g.restore()
    }

    // 남은 감자
    if (!this.finished) {
      const w = R0 - this.left
      this.potato(g, this.left, CY, w, HH * 2, Math.min(34, w / 2))
      paint(g, COLOR.potato, COLOR.outline, 4.5)
      // 잘린 단면
      g.save()
      rrect(g, this.left, CY - HH, w, HH * 2, Math.min(34, w / 2))
      g.clip()
      if (this.left > L0) {
        rrect(g, this.left - 2, CY - HH, 16, HH * 2, 0)
        paint(g, COLOR.potatoFlesh, null)
      }
      g.restore()
    }

    // 안내선
    if (!this.finished) {
      const gx = this.guide
      g.save()
      g.setLineDash([7, 7])
      g.beginPath()
      g.moveTo(gx, CY - HH - 44)
      g.lineTo(gx, CY + HH + 44)
      paint(g, COLOR.sage, null)
      g.strokeStyle = COLOR.sage
      g.lineWidth = 3
      g.stroke()
      g.restore()
      // 판정 폭
      g.globalAlpha = 0.3
      g.fillStyle = COLOR.sage
      g.fillRect(gx - c.good, CY - HH - 44, c.good * 2, 10)
      g.globalAlpha = 0.55
      g.fillRect(gx - c.perfect, CY - HH - 44, c.perfect * 2, 10)
      g.globalAlpha = 1
    }

    // 칼날 불꽃
    for (const s of this.sparks) {
      g.globalAlpha = s.life
      g.beginPath()
      g.arc(s.x, s.y, 2.4, 0, Math.PI * 2)
      g.fillStyle = COLOR.cream
      g.fill()
      g.globalAlpha = 1
    }

    // 칼
    if (this.held) {
      const kx = this.px
      const ky = clamp(this.py, BOARD.y - 40, BOARD.y + BOARD.h + 40)
      g.save()
      g.translate(kx, ky)
      rrect(g, -5, -96, 10, 76, 3)
      paint(g, COLOR.dustyBlue, COLOR.outline, 3)
      rrect(g, -8, -24, 16, 40, 6)
      paint(g, COLOR.earthDark, COLOR.outline, 3)
      g.restore()
    }

    if (this.hint) {
      text(g, '점선 위를 위에서 아래로 그어요', CANVAS.w / 2, BOARD.y + BOARD.h + 34, {
        size: 16,
        color: COLOR.outline,
      })
    }

    // 직전 판정
    if (this.lastGrade && this.now - this.gradeAt < 0.8) {
      const a = 1 - (this.now - this.gradeAt) / 0.8
      g.globalAlpha = a
      text(
        g,
        this.lastGrade + (this.combo > 1 ? `  ${this.combo}연속` : ''),
        clamp(this.left, 150, CANVAS.w - 150),
        CY - HH - 76 - (1 - a) * 16,
        { size: 22, weight: 700, color: COLOR.outline },
      )
      g.globalAlpha = 1
    }

    if (this.finished) {
      text(g, '다 썰었다', CANVAS.w / 2, BOARD.y + BOARD.h + 34, {
        size: 20,
        weight: 700,
        color: COLOR.outline,
      })
    }
  }

  read(): Readout {
    const even = evenness(this.widths)
    const perfect = this.grades.filter((x) => x === '완벽').length
    return {
      status: this.finished ? '완료' : this.lastGrade ?? '시작 전',
      tone: this.finished
        ? 'done'
        : this.lastGrade === '완벽' || this.lastGrade === '좋음'
          ? 'good'
          : this.lastGrade
            ? 'bad'
            : 'idle',
      lines: [
        ['썬 조각', `${this.widths.length}장`],
        ['완벽', `${perfect}장`],
        ['연속', `${this.combo} (최고 ${this.bestCombo})`],
        [
          '평균 두께',
          this.widths.length
            ? `${Math.round(
                this.widths.reduce((s, v) => s + v, 0) / this.widths.length,
              )}px`
            : '-',
        ],
      ],
      bars: [
        { label: '진행', v: clamp((this.left - L0) / (R0 - L0), 0, 1) },
        { label: `균일도 ${pct(even)}`, v: even },
      ],
    }
  }
}
