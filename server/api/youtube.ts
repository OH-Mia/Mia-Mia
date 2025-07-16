export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { type, id, videoId, pageToken } = query

  // 댓글 요청인지 확인
  if (videoId) {
    // 댓글 조회 로직
    const config = useRuntimeConfig(event)
    const apiKey = config.youtubeApiKey

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'YouTube API 키가 설정되지 않았습니다',
      })
    }

    try {
      let url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${encodeURIComponent(videoId)}&maxResults=20&key=${apiKey}`

      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`YouTube API 응답 오류: ${response.status}`)
      }

      const data = await response.json()
      return data
    }
    catch (error) {
      console.error('YouTube Comments API Error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'YouTube 댓글 API 요청 실패',
      })
    }
  }

  // 기존 비디오 조회 로직
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
