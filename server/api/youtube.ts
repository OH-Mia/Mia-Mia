export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { type, id } = query

  // 입력 유효성 검사
  if (!type || !id) {
    throw createError({
      statusCode: 400,
      statusMessage: '필수 파라미터가 누락되었습니다',
    })
  }

  if (!['channel', 'playlist'].includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: '지원되지 않는 타입입니다',
    })
  }

  // 서버에서 환경 변수 직접 접근
  const config = useRuntimeConfig(event)
  const apiKey = config.youtubeApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'YouTube API 키가 설정되지 않았습니다',
    })
  }

  try {
    let url = ''
    const common = `&part=snippet&maxResults=50&key=${apiKey}`

    if (type === 'channel') {
      url = `https://www.googleapis.com/youtube/v3/search?channelId=${encodeURIComponent(id)}&order=date&type=video${common}`
    }
    else if (type === 'playlist') {
      url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${encodeURIComponent(id)}&part=snippet,contentDetails&maxResults=50&key=${apiKey}`
    }

    // 서버에서는 fetch 사용
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API 응답 오류: ${response.status}`)
    }

    const data = await response.json()
    return data
  }
  catch (error) {
    console.error('YouTube API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'YouTube API 요청 실패',
    })
  }
})
