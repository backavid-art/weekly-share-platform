# 주간 기사 공유 플랫폼

매주 같은 레이아웃을 유지하면서 `내용만` 교체해 공유할 수 있는 반응형 웹 템플릿입니다.

## 파일 구조

- `index.html`: 메인 페이지
- `write.html`: 입력형 기사 작성기
- `assets/styles.css`: 반응형 디자인
- `assets/app.js`: 주간 데이터 렌더링
- `assets/writer.js`: 작성기 코드 생성 스크립트
- `content/weeks.js`: 매주 수정하는 데이터 파일
- `assets/images/`: 주차별 이미지 보관

## 가장 쉬운 작성법 (작성기 사용)

1. `write.html` 열기
2. 입력창에 제목/요약/본문/링크 입력
3. `코드 생성` 클릭
4. 생성된 코드를 복사해서 `content/weeks.js`의 `weeks` 배열 맨 위에 붙여넣기
5. 저장 후 페이지 확인

본문 입력 팁:
- 소제목은 `## 소제목`
- 목록은 `- 항목` 형식
- 빈 줄로 문단 구분

## 직접 수정 방식 (기존 방식)

1. 새 이미지를 `assets/images/`에 추가
   - 예: `assets/images/weekly-2026-04-23.jpg`
2. `content/weeks.js`를 열어 `weeks` 배열 맨 위에 새 객체 추가
3. 아래 필드만 바꾸기
   - `id`: `2026-04-23`
   - `dateLabel`: `2026.04.23 (목)`
   - `title`, `summary`
   - `coverImage`: `./assets/images/weekly-2026-04-23.jpg`
   - `sections`, `links`, `attachments`
4. 저장 후 브라우저에서 확인

## 로컬 확인

```bash
cd /Users/cheolu/weekly-share-platform
python3 -m http.server 8080
```

- 브라우저 주소: `http://localhost:8080`

## 배포 옵션

### 1) Netlify (가장 간단)

1. Netlify에서 `weekly-share-platform` 폴더를 연결
2. Build command: 비워두기
3. Publish directory: `.`
4. 배포 완료

`netlify.toml`이 이미 포함되어 있어 추가 설정 없이 작동합니다.

### 2) Vercel

1. Vercel에서 프로젝트 import
2. Framework preset: `Other`
3. 배포

`vercel.json`이 포함되어 있어 라우팅 설정이 적용됩니다.

### 3) GitHub Pages

1. 이 폴더를 GitHub 저장소에 push
2. GitHub 저장소 Settings > Pages 이동
3. Source: Deploy from a branch
4. Branch: `main` / Folder: `/ (root)` 선택 후 Save

`.nojekyll`이 포함되어 있어 정적 파일이 바로 동작합니다.

## 블로그 병행 추천 운영

- 네이버 블로그: 주간 요약 + 대표 이미지 + 웹페이지 링크
- 웹페이지: 전체 본문/아카이브 관리

## 커스터마이징 팁

- 전체 톤 변경: `assets/styles.css`의 `:root` 색상값 수정
- 폰트 변경: `body`, `h1~h4`의 `font-family` 수정
