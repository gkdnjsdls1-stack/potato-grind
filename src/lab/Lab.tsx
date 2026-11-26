import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { COLOR, STAGE } from '../tokens'
import GameCanvas from './GameCanvas'
import { CANVAS, clamp, type Game, type Readout } from './engine'
import { FlipGame, flipDefaults, type FlipCfg } from './Flip'
import { GrateGame, grateDefaults, type GrateCfg } from './Grate'
import { PeelGame, peelDefaults, type PeelCfg } from './Peel'
import { SliceGame, sliceDefaults, type SliceCfg } from './Slice'

// 5단계 손동작 랩.
// 그림 없이 도형으로만 손맛을 본다. 통과 기준은 하나다.
// 아무 목적 없이 2분 동안 계속 하고 있으면 통과, 아니면 멈추고 다시 설계한다.

type KnobDef = {
  key: string
  label: string
  min: number
  max: number
  step: number
  fmt?: (v: number) => string
}

const KNOBS: Record<string, KnobDef[]> = {
  peel: [
    { key: 'rate', label: '깎임 속도', min: 0.04, max: 0.5, step: 0.02 },
    { key: 'band', label: '유효 반경 폭', min: 0.15, max: 1, step: 0.05 },
    { key: 'brush', label: '붓 폭', min: 0, max: 4, step: 1 },
  ],
  slice: [
    { key: 'step', label: '칸 간격', min: 20, max: 90, step: 2 },
    { key: 'perfect', label: '완벽 판정', min: 2, max: 20, step: 1 },
    { key: 'good', label: '좋음 판정', min: 8, max: 50, step: 2 },
    { key: 'rhythmTol', label: '리듬 허용', min: 0.1, max: 0.6, step: 0.05 },
  ],
  grate: [
    { key: 'vMin', label: '최소 속도', min: 100, max: 700, step: 20 },
    { key: 'vMax', label: '최대 속도', min: 400, max: 1800, step: 50 },
    { key: 'yield', label: '획당 효율', min: 0.3, max: 2.5, step: 0.1 },
    { key: 'target', label: '목표량', min: 40, max: 200, step: 10 },
  ],
  flip: [
    { key: 'g0', label: '황금 시작', min: 1, max: 12, step: 0.2 },
    { key: 'g1', label: '황금 끝', min: 1.5, max: 14, step: 0.2 },
    { key: 'burn', label: '타는 시점', min: 3, max: 20, step: 0.5 },
    { key: 'flickV', label: '튕김 문턱', min: 300, max: 1800, step: 50 },
    {
      key: 'showGauge',
      label: '굽기 게이지',
      min: 0,
      max: 1,
      step: 1,
      fmt: (v) => (v ? '보임' : '숨김'),
    },
  ],
}

const TABS = [
  { id: 'peel', name: '깎기', sub: '둥글게 문지르기' },
  { id: 'slice', name: '썰기', sub: '위에서 아래로' },
  { id: 'grate', name: '갈기', sub: '위아래 왕복' },
  { id: 'flip', name: '부치기', sub: '때 맞춰 튕기기' },
] as const

type TabId = (typeof TABS)[number]['id']

const GATE = 120 // 2분

const EMPTY: Readout = { status: '', tone: 'idle', lines: [], bars: [] }

export default function Lab() {
  const [tab, setTab] = useState<TabId>('peel')
  const [cfg, setCfg] = useState<Record<string, Record<string, number>>>({
    peel: { ...peelDefaults },
    slice: { ...sliceDefaults },
    grate: { ...grateDefaults },
    flip: { ...flipDefaults },
  })
  const [read, setRead] = useState<Readout>(EMPTY)
  const [knobsOpen, setKnobsOpen] = useState(false)
  const [focus, setFocus] = useState<Record<string, number>>({
    peel: 0,
    slice: 0,
    grate: 0,
    flip: 0,
  })

  // 게임 루프가 매 프레임 읽을 수 있게 최신 설정을 ref에 둔다
  const cfgRef = useRef(cfg)
  cfgRef.current = cfg

  const games = useMemo<Record<TabId, Game>>(
    () => ({
      peel: new PeelGame(() => cfgRef.current.peel as unknown as PeelCfg),
      slice: new SliceGame(() => cfgRef.current.slice as unknown as SliceCfg),
      grate: new GrateGame(() => cfgRef.current.grate as unknown as GrateCfg),
      flip: new FlipGame(() => cfgRef.current.flip as unknown as FlipCfg),
    }),
    [],
  )

  // 몰입 시간 — 손을 대고 있거나 뗀 지 2초 안이면 흐른다
  const lastTouch = useRef(0)
  const tabRef = useRef<TabId>(tab)
  tabRef.current = tab
  useEffect(() => {
    const id = setInterval(() => {
      if (performance.now() / 1000 - lastTouch.current > 2) return
      setFocus((f) => ({ ...f, [tabRef.current]: f[tabRef.current] + 0.25 }))
    }, 250)
    return () => clearInterval(id)
  }, [])

  const bump = (key: string, dir: number) => {
    const def = KNOBS[tab].find((k) => k.key === key)
    if (!def) return
    setCfg((c) => {
      const v = clamp(
        Math.round((c[tab][key] + def.step * dir) / def.step) * def.step,
        def.min,
        def.max,
      )
      return { ...c, [tab]: { ...c[tab], [key]: v } }
    })
  }

  const toneColor =
    read.tone === 'good'
      ? COLOR.sage
      : read.tone === 'bad'
        ? COLOR.terracotta
        : read.tone === 'done'
          ? COLOR.dustyBlue
          : COLOR.beige

  const f = focus[tab]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: COLOR.cream,
        color: COLOR.ink,
        fontSize: 14,
      }}
    >
      {/* 위 띠 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: STAGE.width,
          height: 44,
          display: 'flex',
          alignItems: 'stretch',
          gap: 6,
          padding: '0 8px',
          background: COLOR.beige,
          borderBottom: `3px solid ${COLOR.outline}`,
        }}
      >
        {TABS.map((t) => {
          const on = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                border: `3px solid ${COLOR.outline}`,
                borderBottom: 'none',
                borderRadius: '12px 12px 0 0',
                marginTop: 6,
                background: on ? COLOR.cream : 'transparent',
                color: COLOR.ink,
                font: 'inherit',
                fontWeight: on ? 700 : 500,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {t.name}
              <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>
                {t.sub}
              </span>
            </button>
          )
        })}
      </div>

      {/* 판 */}
      <div style={{ position: 'absolute', left: 0, top: 44 }}>
        <GameCanvas
          key={tab}
          game={games[tab]}
          onRead={setRead}
          onActive={() => {
            lastTouch.current = performance.now() / 1000
          }}
        />
      </div>

      {/* 계기판 */}
      <div
        style={{
          position: 'absolute',
          left: CANVAS.w,
          top: 44,
          width: STAGE.width - CANVAS.w,
          height: STAGE.height - 44,
          borderLeft: `3px solid ${COLOR.outline}`,
          background: COLOR.beige,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            background: toneColor,
            border: `3px solid ${COLOR.outline}`,
            borderRadius: 10,
            padding: '8px 10px',
            fontWeight: 700,
            fontSize: 17,
            textAlign: 'center',
          }}
        >
          {read.status || '—'}
        </div>

        {read.bars.map((b) => (
          <div key={b.label} style={{ display: 'grid', gap: 4 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{b.label}</div>
            <div
              style={{
                position: 'relative',
                height: 14,
                border: `2.5px solid ${COLOR.outline}`,
                borderRadius: 8,
                background: COLOR.cream,
                overflow: 'hidden',
              }}
            >
              {b.zone && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${b.zone[0] * 100}%`,
                    width: `${(b.zone[1] - b.zone[0]) * 100}%`,
                    top: 0,
                    bottom: 0,
                    background: COLOR.sage,
                    opacity: 0.55,
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${clamp(b.v, 0, 1) * 100}%`,
                  background: COLOR.terracotta,
                  opacity: 0.9,
                }}
              />
            </div>
          </div>
        ))}

        <div style={{ display: 'grid', gap: 3, fontSize: 13 }}>
          {read.lines.map(([k, v]) => (
            <div
              key={k}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
            >
              <span style={{ opacity: 0.65 }}>{k}</span>
              <span
                style={{
                  fontWeight: 600,
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* 통과 기준 — 2분 */}
        <div style={{ display: 'grid', gap: 4 }}>
          <div
            style={{
              fontSize: 12,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ opacity: 0.75 }}>계속 만진 시간</span>
            <span style={{ fontWeight: 700 }}>
              {Math.floor(f / 60)}:{String(Math.floor(f % 60)).padStart(2, '0')}
            </span>
          </div>
          <div
            style={{
              height: 12,
              border: `2.5px solid ${COLOR.outline}`,
              borderRadius: 7,
              background: COLOR.cream,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${clamp(f / GATE, 0, 1) * 100}%`,
                background: f >= GATE ? COLOR.sage : COLOR.dustyBlue,
              }}
            />
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            {f >= GATE ? '2분 넘었다. 통과.' : '목적 없이 2분이면 통과'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => games[tab].reset()}
            style={btn(COLOR.cream)}
          >
            초기화
          </button>
          <button
            onClick={() => setKnobsOpen((v) => !v)}
            style={btn(knobsOpen ? COLOR.dustyBlue : COLOR.cream)}
          >
            손잡이
          </button>
        </div>
      </div>

      {/* 손잡이 — 숫자를 그 자리에서 돌려본다 */}
      {knobsOpen && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: CANVAS.w,
            background: COLOR.beige,
            borderTop: `3px solid ${COLOR.outline}`,
            borderRight: `3px solid ${COLOR.outline}`,
            borderRadius: '0 14px 0 0',
            padding: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {KNOBS[tab].map((k) => {
            const v = cfg[tab][k.key]
            return (
              <div
                key={k.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: `2.5px solid ${COLOR.outline}`,
                  borderRadius: 10,
                  background: COLOR.cream,
                  padding: '4px 6px',
                }}
              >
                <span style={{ fontSize: 12, opacity: 0.7 }}>{k.label}</span>
                <button onClick={() => bump(k.key, -1)} style={tiny}>
                  −
                </button>
                <span
                  style={{
                    minWidth: 46,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {k.fmt ? k.fmt(v) : +v.toFixed(2)}
                </span>
                <button onClick={() => bump(k.key, 1)} style={tiny}>
                  +
                </button>
              </div>
            )
          })}
          <button
            onClick={() =>
              setCfg((c) => ({
                ...c,
                [tab]: {
                  ...({
                    peel: peelDefaults,
                    slice: sliceDefaults,
                    grate: grateDefaults,
                    flip: flipDefaults,
                  } as Record<string, Record<string, number>>)[tab],
                },
              }))
            }
            style={{ ...btn(COLOR.cream), width: 'auto', padding: '4px 12px' }}
          >
            기본값
          </button>
        </div>
      )}

      <a
        href="/"
        style={{
          position: 'absolute',
          left: 10,
          bottom: 8,
          fontSize: 12,
          color: COLOR.outline,
          opacity: 0.55,
          textDecoration: 'none',
        }}
      >
        ← 본 화면
      </a>
    </div>
  )
}

const btn = (bg: string): CSSProperties => ({
  flex: 1,
  border: `3px solid ${COLOR.outline}`,
  borderRadius: 10,
  background: bg,
  color: COLOR.ink,
  font: 'inherit',
  fontWeight: 600,
  fontSize: 14,
  padding: '7px 0',
  cursor: 'pointer',
})

const tiny: CSSProperties = {
  width: 24,
  height: 24,
  border: `2.5px solid ${COLOR.outline}`,
  borderRadius: 7,
  background: COLOR.beige,
  color: COLOR.ink,
  font: 'inherit',
  fontWeight: 700,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
}
