import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  stylistic: true,
  isInEditor: true,
  ignores: [], // ✅ mia 경로 무시 방지
  jsdoc: false, // ✅ jsdoc preset 완전 비활성화
})
