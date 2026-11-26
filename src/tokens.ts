// 1단계에서 잠그는 파일. 여기 없는 색·간격·굵기는 어디서도 새로 만들지 않는다.
// 에셋이 나오면 값만 여기서 바꾼다.

export const COLOR = {
  outline: '#6B5244',
  cream: '#F6EFE4',
  beige: '#E8D9C5',
  dustyBlue: '#A9BFC9',
  sage: '#A8B894',
  terracotta: '#D9A188',
  potato: '#D8B98A',
  potatoDark: '#BF9E72',
  skin: '#F2D5BC',
  hair: '#8A6A52',
  ink: '#4A372C',
} as const

export const STAGE = {
  width: 960,
  height: 540,
} as const

export const STROKE = {
  thin: 1.5,
  base: 2.5,
  thick: 4,
} as const

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
} as const

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const

export const TILE = 72
