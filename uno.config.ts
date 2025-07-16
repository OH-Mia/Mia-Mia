import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // 프리셋 설정
  presets: [
    presetUno(), // 기본 Tailwind CSS 호환 유틸리티
    presetAttributify(), // Attributify 모드 활성화
    presetTypography(), // 타이포그래피 유틸리티
    presetWebFonts({
      fonts: {
        // 필요한 웹폰트 설정
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
    presetIcons({
      collections: {
        // 설치한 아이콘 컬렉션들
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        ic: () => import('@iconify-json/ic/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],

  // 트랜스포머 설정
  transformers: [
    transformerDirectives(), // @apply, @screen 등 지시문 사용 가능
    transformerVariantGroup(), // 변형 그룹화 (hover:(bg-gray-400 font-medium))
  ],

  // 커스텀 규칙 (필요시)
  rules: [
    // 예: ['m-1', { margin: '0.25rem' }]
  ],

  // 테마 설정
  theme: {
    colors: {
      // 커스텀 컬러 팔레트
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      },
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },

  // 안전 목록 (항상 포함될 클래스들)
  safelist: [
    // 동적으로 생성되는 클래스들을 여기에 추가
  ],
})
