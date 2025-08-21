export default defineNuxtPlugin((nuxtApp) => {
  // 전역 에러 핸들러
  nuxtApp.vueApp.config.errorHandler = (error, context) => {
    console.error('Vue Error:', error)

    // 특정 에러 타입에 따른 처리
    if (error.message?.includes('Page not found')) {
      throw createError({
        statusCode: 404,
        statusMessage: '페이지를 찾을 수 없습니다.',
      })
    }
  }

  // 라우터 에러 감지
  nuxtApp.hook('app:error', (error) => {
    console.error('App Error:', error)
  })

  // 페이지 전환 에러 감지
  nuxtApp.hook('page:transition:finish', () => {
    // 페이지 전환 완료 후 실행
  })
})
