import { COLOR } from '../tokens'
import {
  CANVAS,
  clamp,
  inv,
  mix,
  paint,
  rrect,
  text,
  type Game,
  type Readout,
} from './engine'

// 부치기 — 색을 보고 때를 재서, 위로 튕긴다.
// 판정이 둘 곱해진다. 언제 튕겼나(굽기)와 얼마나 세게 튕겼나(회전 수).
// 약하면 안 뒤집히고, 세면 두 바퀴 돌아 같은 면으로 떨어진다. 더 세면 팬 밖이다.

export type FlipCfg = {
  g0: number
  g1: number
  burn: number
  flickV: number
  showGauge: number
}
export const flipDefaults: FlipCfg = {
  g0: 3,
  g1: 4.2,
  burn: 6.5,
  flickV: 700,
  showGauge: 0,
}

const PAN = { x: CANVAS.w / 2 - 30, y: 318, rx: 158, ry: 58 }
const R = 84
const G = 2000

const RAW = '#EBD9B4'
const GOLD = '#D6AC77'
const DEEP = '#A8743F'
const BURNT = '#4A3B30'

type Smoke = { x: number; y: number; r: number; life: number; vx: number }
type Verdict = '설익음' | '황금' | '노릇' | '탐' | '안 뒤집힘' | '바닥행'

export class FlipGame implements Game {
  private phase: 'cook' | 'air' | 'done' = 'cook'
  private side = 0
  private cook = 0
  private doneness: number[] = []
  private verdicts: Verdict[] = []
  private smoke: Smoke[] = []

  private x = 0
  private y = 0
  private vx = 0
  private vy = 0
  private rot = 0
  private rotTo = 0
  private airT = 0
  private airAll = 1
  private halves = 0

  private held = false
  private trail: Array<[number, number, number]> = []
  private msg = ''
  private msgAt = -9
  private now = 0
  private lastFlickV = 0
  private hint = true

  constructor(private cfg: () => FlipCfg) {}

  reset() {
    this.phase = 'cook'
    this.side = 0
    this.cook = 0
    this.doneness = []
    this.verdicts = []
    this.smoke = []
    this.x = 0
    this.y = 0
    this.rot = 0
    this.halves = 0
    this.held = false
    this.trail = []
    this.msg = ''
    this.msgAt = -9
    this.lastFlickV = 0
    this.hint = true
  }

  private say(s: string) {
    this.msg = s
    this.msgAt = this.now
  }

  private grade(t: number): Verdict {
    const c = this.cfg()
    if (t < c.g0) return '설익음'
    if (t <= c.g1) return '황금'
    if (t < c.burn) return '노릇'
    return '탐'
  }

  down(x: number, y: number, t: number) {
    if (this.phase !== 'cook') return
    const dx = x - (PAN.x + this.x)
    const dy = y - (PAN.y + this.y)
    if (Math.hypot(dx, dy * 2.4) > R + 50) return
    this.held = true
    this.trail = [[x, y, t]]
    this.hint = false
  }

  move(x: number, y: number, t: number) {
    if (!this.held) return
    this.trail.push([x, y, t])
    while (this.trail.length > 24) this.trail.shift()
  }

  up(x: number, y: number, t: number) {
    if (!this.held) return
    this.held = false
    this.trail.push([x, y, t])

    // 마지막 100ms 구간의 속도만 본다. 천천히 끌다가 홱 올려도 잡힌다.
    let i = this.trail.length - 1
    while (i > 0 && t - this.trail[i][2] < 0.1) i--
    const a = this.trail[i]
    const dt = Math.max(0.016, t - a[2])
    const vx = (x - a[0]) / dt
    const vy = (y - a[1]) / dt
    this.lastFlickV = -vy

    const c = this.cfg()
    if (-vy < c.flickV) {
      this.say('힘이 모자라')
      return
    }

    const launch = clamp(-vy * 0.42, 260, 1500)
    this.phase = 'air'
    this.vy = -launch
    this.vx = clamp(vx * 0.26, -520, 520)
    this.airAll = (2 * launch) / G
    this.airT = 0
    this.halves = clamp(Math.round(this.airAll / 0.4), 1, 6)
    this.rot = 0
    this.rotTo = this.halves * Math.PI
    this.doneness.push(this.cook)
  }

  step(dt: number, t: number) {
    this.now = t
    const c = this.cfg()

    if (this.phase === 'cook') {
      this.cook += dt
      if (this.cook > c.burn - 1.2 && Math.random() < dt * 9) {
        this.smoke.push({
          x: PAN.x + (Math.random() - 0.5) * R,
          y: PAN.y - 14,
          r: 7 + Math.random() * 7,
          life: 1,
          vx: (Math.random() - 0.5) * 24,
        })
      }
    } else if (this.phase === 'air') {
      this.airT += dt
      this.vy += G * dt
      this.x += this.vx * dt
      this.y += this.vy * dt
      this.rot = this.rotTo * clamp(this.airT / this.airAll, 0, 1)
      if (this.y >= 0 && this.vy > 0) {
        this.land()
      }
    }

    for (const s of this.smoke) {
      s.life -= dt * 0.75
      s.y -= 44 * dt
      s.x += s.vx * dt
      s.r += 13 * dt
    }
    this.smoke = this.smoke.filter((s) => s.life > 0)
  }

  private land() {
    this.y = 0
    this.vy = 0
    const flipped = this.halves % 2 === 1
    const offPan = Math.abs(this.x) > PAN.rx * 0.72

    if (offPan) {
      this.verdicts.push('바닥행')
      this.phase = 'done'
      this.say('바닥에 떨어졌다')
      return
    }
    this.x = 0
    this.vx = 0
    this.rot = flipped ? Math.PI : 0

    if (!flipped) {
      // 돌긴 돌았는데 제자리. 굽기는 계속된다.
      this.verdicts.push('안 뒤집힘')
      this.doneness.pop()
      this.phase = 'cook'
      this.say(`${(this.halves / 2).toFixed(1)}바퀴 — 그대로 떨어졌다`)
      return
    }

    const v = this.grade(this.doneness[this.doneness.length - 1])
    this.verdicts.push(v)
    if (this.side === 0) {
      this.side = 1
      this.cook = 0
      this.phase = 'cook'
      this.say(`앞면 ${v}`)
    } else {
      this.phase = 'done'
      this.say(`뒷면 ${v}`)
    }
  }

  private color(t: number) {
    const c = this.cfg()
    if (t < c.g0) return mix(RAW, GOLD, inv(0, c.g0, t))
    if (t <= c.g1) return GOLD
    if (t < c.burn) return mix(GOLD, DEEP, inv(c.g1, c.burn, t))
    return mix(DEEP, BURNT, inv(c.burn, c.burn + 3, t))
  }

  draw(g: CanvasRenderingContext2D) {
    const c = this.cfg()

    // 불
    const f = (Math.sin(this.now * 11) + 1) * 0.5
    const base = PAN.y + 104
    for (let i = -2; i <= 2; i++) {
      const fh = 40 + f * 12 - Math.abs(i) * 5
      g.beginPath()
      g.moveTo(PAN.x + i * 32 - 13, base)
      g.quadraticCurveTo(PAN.x + i * 32, base - fh, PAN.x + i * 32 + 13, base)
      g.closePath()
      paint(g, COLOR.terracotta, COLOR.outline, 2.5)
    }
    // 화구 받침
    rrect(g, PAN.x - 110, base - 4, 220, 16, 8)
    paint(g, COLOR.earthDark, COLOR.outline, 3.5)

    // 팬
    g.beginPath()
    g.moveTo(PAN.x + PAN.rx - 10, PAN.y - 6)
    g.lineTo(PAN.x + PAN.rx + 150, PAN.y - 26)
    paint(g, null, COLOR.outline, 15)
    g.beginPath()
    g.moveTo(PAN.x + PAN.rx - 10, PAN.y - 6)
    g.lineTo(PAN.x + PAN.rx + 150, PAN.y - 26)
    paint(g, null, COLOR.earthDark, 9)

    g.beginPath()
    g.ellipse(PAN.x, PAN.y + 12, PAN.rx, PAN.ry, 0, 0, Math.PI * 2)
    paint(g, COLOR.outline, COLOR.outline, 4)
    g.beginPath()
    g.ellipse(PAN.x, PAN.y, PAN.rx, PAN.ry, 0, 0, Math.PI * 2)
    paint(g, '#6E5C52', COLOR.outline, 4.5)

    // 감자전
    if (this.phase !== 'done' || this.verdicts[this.verdicts.length - 1] !== '바닥행') {
      const px = PAN.x + this.x
      const py = PAN.y + this.y
      const squash = Math.abs(Math.cos(this.rot))
      const shadow = clamp(1 + this.y / 220, 0.25, 1)
      g.beginPath()
      g.ellipse(PAN.x + this.x * 0.6, PAN.y + 6, R * 0.9 * shadow, 18 * shadow, 0, 0, Math.PI * 2)
      g.fillStyle = 'rgba(0,0,0,0.22)'
      g.fill()

      const top = this.rot % (Math.PI * 2)
      const showBack = top > Math.PI / 2 && top < Math.PI * 1.5
      const faceT = showBack
        ? this.side === 0
          ? 0
          : this.doneness[0] ?? 0
        : this.cook
      g.beginPath()
      g.ellipse(px, py, R, Math.max(5, 26 * squash + 4), 0, 0, Math.PI * 2)
      paint(g, this.color(faceT), COLOR.outline, 4.5)
      // 가장자리 들쭉날쭉
      g.save()
      g.beginPath()
      g.ellipse(px, py, R, Math.max(5, 26 * squash + 4), 0, 0, Math.PI * 2)
      g.clip()
      g.globalAlpha = 0.45
      for (let i = 0; i < 5; i++) {
        g.beginPath()
        g.ellipse(
          px - 46 + i * 23,
          py + (i % 2 ? 5 : -5) * squash,
          11,
          5 * squash + 1.5,
          0,
          0,
          Math.PI * 2,
        )
        g.fillStyle = COLOR.potatoDark
        g.fill()
      }
      g.restore()
      g.globalAlpha = 1
    }

    // 연기
    for (const s of this.smoke) {
      g.globalAlpha = s.life * 0.45
      g.beginPath()
      g.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      g.fillStyle = '#8C8178'
      g.fill()
      g.globalAlpha = 1
    }

    // 게이지 — 기본은 꺼둔다. 색과 연기만 보고 재는 게 본래 설계다.
    if (c.showGauge) {
      const bx = PAN.x - 170
      const bw = 340
      const by = 92
      rrect(g, bx, by, bw, 20, 10)
      paint(g, COLOR.beige, COLOR.outline, 3)
      const to = (s: number) => bx + clamp(s / (c.burn + 2), 0, 1) * bw
      g.fillStyle = COLOR.sage
      g.fillRect(to(c.g0), by + 2, to(c.g1) - to(c.g0), 16)
      g.fillStyle = COLOR.terracotta
      g.fillRect(to(c.burn), by + 2, bw - (to(c.burn) - bx) - 2, 16)
      g.beginPath()
      g.moveTo(to(this.cook), by - 7)
      g.lineTo(to(this.cook), by + 27)
      paint(g, null, COLOR.outline, 4)
    }

    if (this.hint) {
      text(g, '노릇해지면 위로 홱 튕겨요', CANVAS.w / 2, 64, {
        size: 16,
        color: COLOR.outline,
      })
    }
    if (this.msg && this.now - this.msgAt < 1.6) {
      g.globalAlpha = clamp((1.6 - (this.now - this.msgAt)) / 0.6, 0, 1)
      text(g, this.msg, CANVAS.w / 2, 64, {
        size: 22,
        weight: 700,
        color: COLOR.outline,
      })
      g.globalAlpha = 1
    }
    if (this.phase === 'done') {
      text(g, '다시 하려면 아래 초기화', CANVAS.w / 2, CANVAS.h - 28, {
        size: 15,
        color: COLOR.outline,
      })
    }
  }

  read(): Readout {
    const c = this.cfg()
    const g = this.grade(this.cook)
    return {
      status:
        this.phase === 'done'
          ? '완료'
          : this.phase === 'air'
            ? '공중'
            : `${this.side === 0 ? '앞면' : '뒷면'} ${g}`,
      tone:
        this.phase === 'done'
          ? 'done'
          : this.phase === 'air'
            ? 'idle'
            : g === '황금'
              ? 'good'
              : g === '탐'
                ? 'bad'
                : 'idle',
      lines: [
        ['굽는 중', `${this.cook.toFixed(1)}초`],
        ['황금 구간', `${c.g0}~${c.g1}초`],
        ['직전 튕김', this.lastFlickV ? `${Math.round(this.lastFlickV)}px/s` : '-'],
        ['회전', this.halves ? `${(this.halves / 2).toFixed(1)}바퀴` : '-'],
        ['판정', this.verdicts.join(' → ') || '-'],
      ],
      bars: [
        {
          label: '굽기',
          v: clamp(this.cook / (c.burn + 2), 0, 1),
          zone: [c.g0 / (c.burn + 2), c.g1 / (c.burn + 2)],
        },
      ],
    }
  }
}
