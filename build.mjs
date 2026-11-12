// life.guidejung.com 정적 사이트 빌드: node build.mjs [글 파일, 기본 posts.mjs] → dist/
// 글 데이터는 posts.mjs 배열(새 글이 맨 앞). 잘못된 글이 있으면 빌드를 멈춰 깨진 사이트가 올라가지 않게 합니다.
import {mkdirSync, writeFileSync, rmSync, cpSync, existsSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const SITE = {
  name: '생활정보가이드',
  origin: 'https://life.guidejung.com',
  desc: '세금·금융, 시즌 행사, 살림과 요리, 쇼핑, 여행 정보를 한 번에 정리합니다.',
  email: 'kenshin240919@gmail.com',      // guidejung.com과 같은 문의 주소
  adsense: 'ca-pub-3087515825675332',    // guidejung.com·gov와 같은 게시자 ID
};
// [주소용 slug, 이름, 필명, 분류 소개]
const CATS = [
  ['money', '금융·세금', '돈계산노트', '세금 신고, 공제, 연금, 대출처럼 숫자가 중요한 정보를 공식 기준으로 정리합니다.'],
  ['season', '시즌·행사', '철따라', '명절, 김장, 축제처럼 때가 있는 일을 미리 준비할 수 있게 정리합니다.'],
  ['life', '생활·요리', '살림노트', '레시피, 보관법, 청소와 살림 요령을 순서대로 정리합니다.'],
  ['shopping', '쇼핑·할인', '알뜰장바구니', '마트 행사, 카드 혜택, 할인 정보를 조건과 함께 정리합니다.'],
  ['travel', '여행·날씨', '여행메모', '지역별 날씨, 옷차림, 여행 준비물을 정리합니다.'],
  ['it', 'IT·앱', '폰설정', '앱 설치, 설정, 해지 방법을 화면 순서대로 정리합니다.'],
];
const PER_PAGE = 30;

const postsFile = process.argv[2] || './posts.mjs';
const {posts} = await import(pathToFileURL(postsFile).href);
const root = 'dist';

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const cat = name => CATS.find(c => c[1] === name);
const dot = d => d.replaceAll('-', '.');
const url = p => SITE.origin + p;
const postPath = p => `/p/${p.slug}/`;
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ---------- 글 검사 ----------
function check(list) {
  const errors = [], seen = new Set();
  list.forEach((p, i) => {
    const at = `posts[${i}] ${p.slug || '(slug 없음)'}`;
    for (const k of ['slug', 'cat', 'title', 'desc', 'keyword', 'published', 'lead'])
      if (!p[k] || typeof p[k] !== 'string') errors.push(`${at}: ${k} 없음`);
    if (p.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`${at}: slug는 영문 소문자·숫자·하이픈만`);
    if (seen.has(p.slug)) errors.push(`${at}: slug 중복`);
    seen.add(p.slug);
    if (p.cat && !cat(p.cat)) errors.push(`${at}: 분류 '${p.cat}'는 ${CATS.map(c => c[1]).join(', ')} 중 하나여야 함`);
    for (const k of ['published', 'modified'])
      if (p[k] && !/^\d{4}-\d{2}-\d{2}$/.test(p[k])) errors.push(`${at}: ${k}는 YYYY-MM-DD`);
    if (!Array.isArray(p.sections) || p.sections.length < 4) errors.push(`${at}: sections(소제목) 4개 이상`);
    if (!Array.isArray(p.faq) || p.faq.length < 2) errors.push(`${at}: faq 2개 이상`);
    if (!(p.sections || []).some(s => /<table[\s>]/.test(s[1] || ''))) errors.push(`${at}: 본문에 표(<table>) 1개 이상`);
    if (/<script/i.test(JSON.stringify(p))) errors.push(`${at}: 글에 <script> 금지`);
  });
  if (errors.length) throw new Error('글 검사 실패\n' + errors.join('\n'));
}
check(posts);
rmSync(root, {recursive: true, force: true});  // 지운 글의 페이지가 남지 않게 매번 새로 만듦
// 날짜 내림차순, 같은 날은 배열 순서(맨 앞 = 최신) 유지
const sorted = posts.map((p, i) => [p, i]).sort((a, b) => b[0].published.localeCompare(a[0].published) || a[1] - b[1]).map(x => x[0]);

// ---------- 공통 틀 ----------
function page({title, desc, path, body, head = '', image = '/og.png', type = 'website', cur = path.match(/^\/c\/([a-z]+)\//)?.[1] || (/^\/(page\/\d+\/)?$/.test(path) ? 'all' : '')}) {
  const full = title === SITE.name ? title : `${title} - ${SITE.name}`;
  const on = s => s === cur ? ' aria-current="page"' : '';
  const nav = CATS.map(c => `<a class="k-${c[0]}" href="/c/${c[0]}/"${on(c[0])}>${c[1]}</a>`).join('');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url(path)}">
<meta property="og:site_name" content="${esc(SITE.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${type}"><meta property="og:url" content="${url(path)}"><meta property="og:image" content="${url(image)}"><meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">
<link rel="alternate" type="application/rss+xml" title="${esc(SITE.name)}" href="${url('/rss.xml')}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsense}" crossorigin="anonymous"></script>${head}</head>
<body><a class="skip" href="#main">본문으로 바로가기</a><header><div class="wrap top"><a class="brand" href="/"><img src="/favicon.svg" alt="" width="30" height="30">${esc(SITE.name)}</a>
<form class="search" action="https://www.google.com/search" role="search"><input type="hidden" name="as_sitesearch" value="life.guidejung.com"><label class="sr" for="q">사이트 검색</label><input id="q" name="q" type="search" placeholder="검색"><button>검색</button></form></div>
</header><nav class="gnb" aria-label="분류"><div class="wrap"><a href="/"${on('all')}>전체</a>${nav}</div></nav>
<main id="main" class="wrap">${body}</main>
<footer><div class="wrap"><p><a href="/about/">사이트 소개</a> · <a href="/privacy/">개인정보 처리방침</a> · <a href="/contact/">문의</a> · <a href="/rss.xml">RSS</a></p>
<p>© 2026 ${esc(SITE.name)} · <a href="https://guidejung.com/">guidejung.com</a></p></div></footer></body></html>`;
}
function write(path, data) {
  const file = root + path + (path.endsWith('/') ? 'index.html' : '');
  mkdirSync(file.slice(0, file.lastIndexOf('/')), {recursive: true});
  writeFileSync(file, data);
}

// ---------- 목록(게시판) ----------
function board(list) {
  if (!list.length) return '<p class="empty">아직 글이 없습니다.</p>';
  return `<table class="board"><thead><tr><th class="c-cat">분류</th><th>제목</th><th class="c-date">등록일</th><th class="c-author">글쓴이</th></tr></thead><tbody>${
    list.map(p => `<tr><td class="c-cat"><a class="chip k-${cat(p.cat)[0]}" href="/c/${cat(p.cat)[0]}/">${p.cat}</a></td><td class="c-title"><a href="${postPath(p)}">${esc(p.title)}</a></td><td class="c-date">${p.published}</td><td class="c-author">${cat(p.cat)[2]}</td></tr>`).join('')
  }</tbody></table>`;
}
function pager(base, n, total) {
  if (total <= 1) return '';
  const href = i => i === 1 ? base : `${base}page/${i}/`;
  return `<nav class="pager" aria-label="페이지">${Array.from({length: total}, (_, i) => i + 1)
    .map(i => i === n ? `<b aria-current="page">${i}</b>` : `<a href="${href(i)}">${i}</a>`).join('')}</nav>`;
}
const paths = [];  // sitemap: [path, lastmod]
function listing(base, title, desc, heading, list) {
  const total = Math.max(1, Math.ceil(list.length / PER_PAGE));
  for (let n = 1; n <= total; n++) {
    const path = n === 1 ? base : `${base}page/${n}/`;
    const chunk = list.slice((n - 1) * PER_PAGE, n * PER_PAGE);
    write(path, page({title: n === 1 ? title : `${title} ${n}쪽`, desc, path,
      body: `${heading}${board(chunk)}${pager(base, n, total)}`}));
    paths.push([path, chunk[0]?.modified || chunk[0]?.published]);
  }
}
listing('/', SITE.name, SITE.desc, `<section class="hello"><h1>${esc(SITE.name)}</h1><p>${SITE.desc} 금액·기준·일정은 공식 자료로 확인해 씁니다.</p></section>
<ul class="tiles">${CATS.map(([s, n, , d]) => `<li><a class="k-${s}" href="/c/${s}/"><b>${n}</b><span>${d}</span></a></li>`).join('')}</ul><h2 class="board-h">최신 글</h2>`, sorted);
for (const [slug, name, , intro] of CATS)
  listing(`/c/${slug}/`, name, intro, `<div class="cat-head k-${slug}"><h1>${name}</h1><p class="intro">${intro}</p></div>`, sorted.filter(p => p.cat === name));

// ---------- 글 ----------
sorted.forEach((p, i) => {
  const [cslug, , author] = cat(p.cat);
  const path = postPath(p), modified = p.modified || p.published;
  const related = [...sorted.filter(q => q !== p && q.keyword === p.keyword), ...sorted.filter(q => q !== p && q.cat === p.cat && q.keyword !== p.keyword)].slice(0, 6);
  const newer = sorted[i - 1], older = sorted[i + 1];
  const image = p.image || '/og.png';
  const article = {'@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.desc,
    datePublished: p.published, dateModified: modified, image: url(image), mainEntityOfPage: url(path),
    author: {'@type': 'Person', name: author}, publisher: {'@type': 'Organization', name: SITE.name, url: SITE.origin}};
  const faq = {'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) =>
    ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a.replace(/<[^>]+>/g, '')}}))};
  const body = `<article class="post"><nav class="crumbs" aria-label="현재 위치"><a href="/">홈</a> › <a class="chip k-${cslug}" href="/c/${cslug}/">${p.cat}</a></nav>
<h1>${esc(p.title)}</h1><p class="meta"><span>${author}</span><span>등록 ${dot(p.published)}</span>${modified !== p.published ? `<span>수정 ${dot(modified)}</span>` : ''}</p>
${p.image ? `<img class="hero" src="${p.image}" alt="${esc(p.imageAlt || p.title)}" width="1200" height="630">` : ''}
<p class="lead">${p.lead}</p>
${p.sections.map(([h, html]) => `<h2>${esc(h)}</h2>${html.replace(/<table/g, '<div class="tbl"><table').replace(/<\/table>/g, '</table></div>')}`).join('\n')}
<h2>자주 묻는 질문</h2>${p.faq.map(([q, a]) => `<details class="faq" open><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}
${p.sources?.length ? `<h2>참고한 공식 자료</h2><ul class="sources">${p.sources.map(([n, u]) => `<li><a href="${esc(u)}" rel="nofollow noopener" target="_blank">${esc(n)}</a></li>`).join('')}</ul>` : ''}
<p class="note">이 글은 ${dot(modified)} 기준으로 정리했습니다. 금액·기준·일정은 바뀔 수 있으니 신청이나 결정 전에 공식 자료를 다시 확인해 주세요.</p>
</article>
<nav class="prevnext">${newer ? `<a href="${postPath(newer)}">← ${esc(newer.title)}</a>` : '<span></span>'}${older ? `<a href="${postPath(older)}">${esc(older.title)} →</a>` : ''}</nav>
${related.length ? `<section class="related"><h2>함께 보면 좋은 글</h2>${board(related)}</section>` : ''}`;
  write(path, page({title: p.title, desc: p.desc, path, image, type: 'article', body, cur: cslug,
    head: `<meta property="article:published_time" content="${p.published}"><meta property="article:modified_time" content="${modified}">${ld(article)}${ld(faq)}`}));
  paths.push([path, modified]);
});

// ---------- 고정 페이지 ----------
const statics = [
  ['/about/', '사이트 소개', `${SITE.name} 운영 원칙과 글쓴이 안내입니다.`, `<article class="post"><h1>사이트 소개</h1>
<p>${esc(SITE.name)} 생활 정보관(life.guidejung.com)은 <a href="https://guidejung.com/">guidejung.com</a>과 같은 운영자가 만드는 생활 정보 사이트입니다. 세금·금융, 시즌 행사, 살림과 요리, 쇼핑, 여행, 앱 사용법을 다룹니다.</p>
<h2>글은 이렇게 씁니다</h2><ul><li>금액·기준·일정은 정부·기관·기업의 공식 자료에서 확인한 내용만 쓰고, 글 끝에 참고한 자료를 적습니다.</li><li>글마다 기준일을 표시합니다. 바뀐 내용을 알게 되면 글을 고치고 수정일을 남깁니다.</li><li>확인하지 않은 경험담이나 후기를 지어내지 않습니다.</li></ul>
<h2>글쓴이</h2><p>분류마다 필명(${CATS.map(c => c[2]).join(', ')})을 나눠 쓰지만, 모두 같은 운영자가 씁니다. 글 작성과 자료 정리에 AI 도구를 함께 사용하며, 발행 전에 공식 자료와 대조합니다.</p>
<h2>광고</h2><p>이 사이트는 Google AdSense 광고를 싣습니다. 광고와 글은 구분해 보여 주며 광고 클릭을 권하지 않습니다.</p></article>`],
  ['/privacy/', '개인정보 처리방침', '방문자 정보 처리와 광고 쿠키 안내입니다.', `<article class="post"><h1>개인정보 처리방침</h1><p class="meta"><span>시행일 2026.11.13</span></p>
<h2>1. 수집하는 정보</h2><p>이 사이트는 회원가입, 댓글, 입력 양식이 없어 이름·연락처를 받지 않습니다. 호스팅(GitHub Pages)은 보안과 운영을 위해 접속 IP 등 기록을 처리할 수 있습니다.</p>
<h2>2. 광고와 쿠키</h2><p>Google 등 제3자 광고 업체는 쿠키를 사용해 이 사이트와 다른 사이트 방문 기록을 바탕으로 광고를 보여 줄 수 있습니다. 맞춤 광고는 <a href="https://adssettings.google.com/" rel="noopener" target="_blank">Google 광고 설정</a>에서 끌 수 있습니다. 자세한 내용은 <a href="https://policies.google.com/technologies/ads?hl=ko" rel="noopener" target="_blank">Google 광고 정책</a>을 확인해 주세요.</p>
<h2>3. 문의</h2><p>이메일로 문의하시면 답변을 위해 보내신 주소와 내용을 확인합니다. 문의: <a href="mailto:${SITE.email}">${SITE.email}</a></p></article>`],
  ['/contact/', '문의', '오류 제보와 문의 방법입니다.', `<article class="post"><h1>문의</h1><p>글의 오류나 바뀐 정보를 알려 주시면 확인 후 고치겠습니다.</p><p>이메일: <a href="mailto:${SITE.email}">${SITE.email}</a></p><p>글 제목이나 주소, 어느 부분이 다른지 함께 적어 주세요. 주민등록번호·계좌번호 같은 개인정보는 보내지 마세요.</p></article>`],
];
for (const [path, title, desc, body] of statics) { write(path, page({title, desc, path, body})); paths.push([path, null]); }
write('/404.html', page({title: '페이지를 찾을 수 없습니다', desc: SITE.desc, path: '/404.html',
  body: '<article class="post"><h1>페이지를 찾을 수 없습니다</h1><p>주소가 바뀌었거나 삭제된 글입니다. <a href="/">첫 화면</a>에서 다시 찾아 주세요.</p></article>'}));

// ---------- 사이트맵·RSS·기타 ----------
const xml = s => String(s).replace(/[<>&"']/g, c => ({'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'})[c]);
write('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${
  paths.map(([p, d]) => `<url><loc>${url(p)}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('')}</urlset>\n`);
write('/rss.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(SITE.name)}</title><link>${SITE.origin}/</link><description>${xml(SITE.desc)}</description><language>ko</language><atom:link href="${url('/rss.xml')}" rel="self" type="application/rss+xml"/>${
  sorted.slice(0, 50).map(p => `<item><title>${xml(p.title)}</title><link>${url(postPath(p))}</link><guid isPermaLink="true">${url(postPath(p))}</guid><description>${xml(p.desc)}</description><category>${xml(p.cat)}</category><pubDate>${new Date(p.published + 'T09:00:00+09:00').toUTCString()}</pubDate></item>`).join('')}</channel></rss>\n`);
write('/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${url('/sitemap.xml')}\n`);
write('/ads.txt', `google.com, ${SITE.adsense.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
write('/CNAME', new URL(SITE.origin).host + '\n');
write('/.nojekyll', '');
if (existsSync('static')) cpSync('static', root, {recursive: true});
console.log(`글 ${posts.length}개, 페이지 ${paths.length}개 → ${root}/`);
