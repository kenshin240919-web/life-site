# life.guidejung.com (생활정보가이드) 운영 안내

이 폴더는 https://life.guidejung.com 의 소스입니다. 세금·금융, 시즌 행사, 살림·요리, 쇼핑, 여행, 앱 사용법을 게시판형 목록으로 보여 주는 정적 사이트입니다. guideruri.com(`D:\guidejung\key\digital-guide-site`)과 같은 방식으로 운영합니다.

## 매일 자동 발행
- Claude 데스크톱 앱 예약 작업 **`life-daily-post`**(10·14·19시, 회당 2편)가 글을 쓰고 발행합니다. 지시문 원본: `scheduled-task.md`.
- 키워드: `python D:\guidejung\key\daily_keywords.py --profile life --skip-if-done` → `D:\guidejung\key\reports\life\날짜.json`의 `top`을 위에서부터. 쓴 키워드와 건너뛴 키워드는 `--profile life --written 키워드`로 기록합니다.

## 구조와 배포
- 글 데이터: `posts.mjs` 배열 **맨 앞**에 새 글을 추가합니다. 형식 예시는 `sample-posts.mjs`.
- 빌드: `node build.mjs` → `dist/`(첫 화면·분류·글·사이트맵·RSS·ads.txt·CNAME). 글 형식이 틀리면 빌드가 멈추고 이유를 알려 줍니다.
  화면 시험: `node build.mjs ./sample-posts.mjs` (시험 뒤 `node build.mjs`로 되돌리기. dist는 git에 올리지 않음).
- 배포: `main`에 push하면 GitHub Actions(`.github/workflows/pages.yml`)가 빌드해 GitHub Pages로 배포합니다.
- 도메인: guidejung.com DNS(Cloudflare)의 `life` CNAME → kenshin240919-web.github.io (프록시 끔).
- 사이트 이름·문의 주소·애드센스 ID·분류·필명은 `build.mjs` 맨 위 `SITE`, `CATS`에 있습니다.
- 방문 통계·검색엔진 인증: `SITE.ga`(GA4 G-…), `SITE.clarity`, `SITE.verify`(google·naver·bing 메타태그 content), `SITE.daumPin`(robots.txt 마지막 줄). 값을 넣고 빌드·push하면 모든 페이지에 들어가고 개인정보 처리방침에 고지가 붙습니다.

## 글 형식 (posts.mjs 한 항목)
- `slug` 영문 소문자·숫자·하이픈, `cat` 분류 6개 중 하나(금융·세금, 시즌·행사, 생활·요리, 쇼핑·할인, 여행·날씨, IT·앱), `keyword` key가 준 메인 키워드
- `title`, `desc`(1~2문장), `published`·`modified`(YYYY-MM-DD, 한국 날짜), `lead`(HTML 가능)
- `sections`: [소제목, 본문 HTML] 4~6개, 본문 어딘가에 `<table>` 1개 이상
- `faq`: [질문, 답] 2~4개, `sources`: [이름, 실제로 읽은 공식 URL]
- 선택: `image`(`/img/파일.png`, static/img에 둠), `imageAlt`

## 지킬 것
- 금액·기준·일정은 공식 자료에서 확인한 것만 씁니다. 확인하지 않은 경험담·후기·수치를 지어내지 않습니다.
- 숫자만 바꾼 중복 글(40kg/20kg/10kg처럼)은 쓰지 않습니다. 같은 키워드 글이 이미 있으면 쓰지 않습니다.
- 모든 글은 `anthropic-skills:korean-blog-anti-slop` 스킬로 다듬은 뒤 올립니다.
- 기존 글을 고치면 `modified`만 바꾸고 `published`는 그대로 둡니다. 전날 날짜로 소급해 쓰지 않습니다.
- 공개 저장소이므로 키·비밀번호·개인정보를 넣지 않습니다. 유료 API는 쓰지 않습니다.
