// 1단계에서 잠그는 파일. 여기 없는 색·간격·굵기는 어디서도 새로 만들지 않는다.
// 색은 눈으로 고른 값이 아니라 주인공 정면 에셋 PNG에서 직접 뽑아낸 값이다.

export const COLOR = {
  // 캐릭터 에셋에서 추출
  outline: '#563529', // 모든 윤곽선
  ink: '#4D3328', // 눈동자, 글자
  skin: '#F9E1C4',
  hair: '#785343',
  terracotta: '#D38A72', // 셔츠
  dustyBlue: '#9EB0B9', // 앞치마
  sage: '#A8B192', // 주머니
  earth: '#95765A', // 바지
  earthDark: '#805C49', // 장화
  potato: '#D6AC77', // 감자 껍질
  potatoDark: '#B2894F', // 감자 그늘
  potatoFlesh: '#F2E3C4', // 감자 속살

  // 배경 에셋이 나오면 교체한다
  cream: '#F6EFE4',
  beige: '#E8D9C5',
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

export const FONT =
  "system-ui, -apple-system, 'Noto Sans KR', sans-serif"
