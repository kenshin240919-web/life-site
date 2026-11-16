---
name: life-daily-post
description: 하루 3번(10·14·19시) life.guidejung.com에 key 추천 키워드로 글 2편 작성·발행 (GitHub Pages)
---

'생활정보가이드'(https://life.guidejung.com/)에 글 2편을 작성·검증·공개 발행하세요. 사용자는 매 실행마다 별도 확인 없이 글 작성, git commit/push, GitHub Pages 배포, key 기록(--written)을 승인했습니다. 결과는 한국어로 보고하세요.

## 환경
- 저장소: D:/guidejung/life-site (GitHub: kenshin240919-web/life-site, 브랜치 main). 시작할 때 `git pull --ff-only`. 운영 규칙은 저장소의 CLAUDE.md를 먼저 읽으세요.
- 키워드: D:/guidejung/key/daily_keywords.py의 life 프로필.

## 순서
1. 한국 날짜: `TZ=KST-9 date +%F`. 전날로 소급하지 마세요.
2. 편수 확인: posts.mjs에서 published가 오늘인 글이 10편 이상이면 쓰지 말고 보고만 하고 끝내세요. 이번 실행은 2편입니다.
3. 키워드: `python D:/guidejung/key/daily_keywords.py --profile life --skip-if-done`를 실행한 뒤 `D:/guidejung/key/reports/life/<오늘>.json`의 `top`을 위에서부터 봅니다. 아래에 해당하면 건너뛰고 다음 키워드를 봅니다.
   - posts.mjs에 같은 keyword 글이 이미 있음
   - 특정 사이트·상품·사람을 찾아가는 검색어(로그인 페이지, 게임·브랜드 이름 등), 실시간 값(시세·환율·당일 날씨), 개별 투자상품 추천이 되는 글
   - 공식 자료로 사실을 확인할 수 없는 주제
   건너뛴 키워드도 `python D:/guidejung/key/daily_keywords.py --profile life --written <키워드>`로 기록해 다시 나오지 않게 하세요.
   세부 키워드(`details`)는 소제목·FAQ 주제로 활용하되, 숫자만 다른 변형으로 글을 따로 쓰지 마세요.
   분류 고르게(11/16 사용자): 이번 실행의 2편은 서로 다른 분류로 쓰세요. 그리고 오늘(published가 오늘) 글 중 금융·세금이 아닌 글이 아직 없으면 이번 실행에서 1편 이상은 금융·세금이 아닌 분류로 쓰세요. top을 끝까지 봐도 맞는 키워드가 없으면 아래 '달마다 시즌 주제'에서 이번 달 줄을 보고 posts.mjs에 아직 없는 주제 하나를 골라 시즌·행사(또는 여행·날씨)로 쓰세요. 이때 keyword에는 사람들이 실제로 검색하는 짧은 말(예: 김장비용)을 넣고, 쓴 뒤 `--written`으로 기록하세요. 날짜·금액은 그해 공식 발표로만 씁니다(발표 전이면 다른 주제).
   달마다 시즌 주제:
   - 11월: 김장 비용·할인, 수능 당일 교통·소음 통제, 연말정산 미리보기
   - 12월: 연말정산 간소화 일정, 해돋이 명소 교통 통제, 연말 휴무
   - 1월: 설 승차권 예매, 설 선물 할인·택배 마감, 연말정산 서류 제출
   - 2월: 설 연휴 고속도로 통행료·귀성, 설 연휴 문 여는 병원·약국, 정월대보름
   - 3월: 신학기 준비·돌봄, 미세먼지·황사 대비
   - 4월: 벚꽃 개화 시기·축제, 봄 나들이 교통
   - 5월: 종합소득세 신고, 근로장려금 신청, 가정의 달 행사
   - 6월: 장마 대비, 여름휴가 숙박 할인
   - 7월: 휴가철 고속도로·휴게소, 폭염 대비
   - 8월: 추석 선물·택배 마감, 추석 승차권 예매
   - 9월: 추석 연휴 귀성·통행료, 벌초·성묘
   - 10월: 단풍 절정 시기, 독감 예방접종, 수능 준비
4. 사실 확인: 국세청·정부24·각 기관·기업 공식 공지 등 공식 자료를 웹에서 직접 읽고 금액·기준·일정을 확인하세요. sources에는 실제로 읽은 URL만 넣습니다. 확인하지 않은 경험·후기·수치를 지어내지 마세요. 연도가 들어가는 내용은 2027년 기준으로 쓰되(키워드에 연도가 있으면 그 연도), 아직 발표되지 않은 2027년 수치는 만들지 말고 "2026년 기준, 발표되면 갱신"처럼 쓰세요.
5. 작성: posts.mjs 배열 맨 앞에 새 객체를 넣으세요(형식은 CLAUDE.md '글 형식', 예시는 sample-posts.mjs).
   - 분류는 6개(금융·세금, 시즌·행사, 생활·요리, 쇼핑·할인, 여행·날씨, IT·앱) 중 내용에 맞는 하나. 제목은 "키워드, 부연 설명" 한 줄이되 매번 같은 끝맺음을 피하세요.
   - 분량은 공백 빼고 2,000~2,500자. 도입 2~3문장 → 소제목 4~6개 → 표 1개 이상 → FAQ 2~4개. 존댓말("~합니다/~하세요").
   - 초안 뒤 Skill 도구로 `anthropic-skills:korean-blog-anti-slop`을 불러 AI 티 나는 표현과 구조를 고치세요. 사실·수치·출처는 바꾸지 마세요. 못 불렀으면 보고에 적으세요.
6. 빌드: D:/guidejung/life-site에서 `node build.mjs`. 글 검사에 실패하면 알려 준 항목을 고쳐 다시 빌드하세요.
7. 발행: `git add -A && git commit -m "Add <날짜> posts: <slug1>, <slug2>"`(메시지 끝에 빈 줄 다음 `Co-Authored-By: Claude <noreply@anthropic.com>`) 후 `git push`. `gh run watch <최신 run id> --exit-status`로 배포 성공을 확인하세요.
8. 기록: 쓴 키워드마다 `python D:/guidejung/key/daily_keywords.py --profile life --written <키워드>`.
9. 공개 확인: https://life.guidejung.com/p/<slug>/ 가 200이면 완료(HTTPS 인증서가 아직이면 http 주소로 확인). 결과가 모호하면 다시 발행하기 전에 git log, Actions 상태, 공개 URL부터 확인하세요.

## 보고
완료하면 글 제목, 분류, 공개 URL, 건너뛴 키워드와 이유, 안티슬롭 적용 여부를 남기세요. 실패하면 멈춘 단계와 원인을 사실대로 보고하세요.

## 화면 알림
보고를 쓰기 전에 결과 요약(성공이면 제목 · URL, 실패면 멈춘 단계 · 원인, 200자 안)을 UTF-8 텍스트 파일(스크래치패드)에 쓰고 `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\User\.claude\scripts\popup.ps1 -title "생활정보가이드 발행" -file <그 파일>` 을 실행해 화면에 띄웁니다.