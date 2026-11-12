// 형식 예시 + 빌드 시험용 (node build.mjs ./sample-posts.mjs). 실제 사이트에는 posts.mjs만 올라갑니다.
export const posts = [
  {
    slug: 'sample-kimchi-storage', cat: '생활·요리', keyword: '김치보관법',
    title: '[예시] 김치 보관법, 김치냉장고와 일반 냉장고 온도 차이',
    desc: '[예시 글] 김치를 오래 맛있게 두려면 온도와 공기를 막는 것이 중요합니다. 보관 장소별 차이를 표로 정리했습니다.',
    published: '2026-11-13', modified: '2026-11-13',
    lead: '이 글은 사이트 화면과 글 형식을 확인하기 위한 <b>예시</b>입니다. 실제 글은 공식 자료를 확인해 씁니다.',
    sections: [
      ['보관 장소별 차이', '<p>예시 문단입니다. 표는 본문에 꼭 하나 이상 넣습니다.</p><table><thead><tr><th>장소</th><th>특징</th></tr></thead><tbody><tr><td>김치냉장고</td><td>예시 값</td></tr><tr><td>일반 냉장고</td><td>예시 값</td></tr></tbody></table>'],
      ['통에 담는 순서', '<ol><li>예시 단계 하나</li><li>예시 단계 둘</li></ol>'],
      ['익는 속도 조절', '<p>예시 문단입니다.</p>'],
      ['자주 하는 실수', '<ul><li>예시 항목</li></ul>'],
    ],
    faq: [['예시 질문 하나?', '예시 답변입니다.'], ['예시 질문 둘?', '예시 답변입니다.']],
    sources: [['예시 공식 자료', 'https://www.mfds.go.kr/']],
  },
];
