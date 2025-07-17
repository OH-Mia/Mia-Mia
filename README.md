### Mia Mia

## history

## v0.1.0

- `nuxt.config.ts`: app 하위 head 정보 업데이트

**`관련 사항`**
- `/public`: `kkamgo.png` 파일 추가

## v0.1.1

- 스토어
  - 파이어베이스서치 스토어 파일 추가
  - 네이버서치 스토어 파일 추가
  - 유튜브비디오 스토어 파일 추가

- 헤더 컴포넌트
  - 파일 생성 및 `/layouts/defalut.vue` 파일 내 추가

- 사이드 바 컴포넌트
  - 파일 생성 및 `/layouts/defalut.vue` 파일 내 추가

- 비디오 카드 컴포넌트
  - 파일 생성 및 기능 구현
  - `브이로그`, `마데로그`, `왓츠인마이백` 메인 화면 적용

- 브이로그, 마데로그, 왓츠인마이백
  - 메인 화면 구현
  - 상세 화면 구현

**`관련 사항`**
- `nuxt.config.ts`:
  - pinia, dayjs, 아이콘 관련 라이브러리 추가 설치 및 관련 설정
  - 서버 프록시 설정 주석 처리
- `app.vue`: 파일 내 NuxtLayout 추가
- `/public/icons`: `sidebar-open.png`, `sidebar-close.png` 파일 추가
- `/server/api/youtube.ts`: Nuxt의 서버 라우트 사용할 수 있도록 수정
- `/stores`
  - `useFirebaseSearchStore.ts`: 파이어베이스서치 스토어 파일 추가
  - `useNaverSearchStore.ts`: 네이버서치 스토어 파일 추가
  - `useYoutubeVideoStore.ts`: 유튜브비디오 스토어 파일 추가

## v0.1.2

- 공통
  - 전역 모바일 확대 방지 설정 추가

- 헤더 컴포넌트
  - 모바일 환경에서 스크롤 시 헤더 자동 숨김/보임 기능 추가

**`관련 사항`**
- `nuxt.config.ts`: app 하위 head.viewport 정보 업데이트
- `app.vue`: 파일 내 NuxtLayout 추가
  - 전역 모바일 확대 방지 설정 추가를 위한 스타일 코드 추가
