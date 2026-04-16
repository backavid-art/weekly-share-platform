window.WEEKLY_CONTENT = {
  siteTitle: "교회/사역 주간 기사 공유",
  intro:
    "매주 같은 레이아웃으로 기사와 소식을 정리해 공유하는 페이지입니다. 이번 주 카드만 바꿔도 자동으로 아카이브에 누적됩니다.",
  contact: "문의: your-email@example.com",
  weeks: [
    {
      id: "2026-04-16",
      dateLabel: "2026.04.16 (목)",
      title: "이번 주 주요 기사 요약",
      summary:
        "이번 주에는 핵심 이슈 3건을 중심으로 배경, 시사점, 실천 포인트를 간단히 정리했습니다.",
      coverImage: "./assets/images/weekly-2026-04-16.jpg",
      galleryImages: [
        { caption: "주보 전체 이미지", url: "./assets/images/weekly-2026-04-16.jpg" }
      ],
      articleText:
        "## 핵심 정리\n이번 주 가장 중요한 흐름을 2~3문장으로 요약합니다.\n현장에 적용할 포인트를 함께 적으면 전달력이 높아집니다.\n\n## 주요 포인트\n- 기사에서 놓치면 안 되는 문장 1개\n- 기사 배경 맥락 1개\n- 우리 공동체에 주는 의미 1개\n\n## 실천 제안\n이번 주 안에 실행할 수 있는 작은 행동 한 가지를 제안해 보세요.",
      serviceOrder: [
        { time: "10:50", title: "예배 준비", person: "인도자" },
        { time: "11:00", title: "찬양", person: "찬양팀" },
        { time: "11:05", title: "대표 기도", person: "기도자" },
        { time: "11:20", title: "말씀 선포", person: "담임목사" }
      ],
      events: [
        {
          title: "교사 기도회",
          date: "2026.04.24(금) 20:00",
          place: "비전홀",
          target: "교사/교역자",
          description: "다음세대 사역 나눔",
          apply: "",
          contact: "교육부장 010-0000-0000",
          extra: []
        }
      ],
      sections: [
        {
          heading: "핵심 포인트 1",
          body: "기사의 핵심 메시지를 2~3문장으로 정리하세요. 모바일에서도 읽기 편하게 짧은 문단으로 나누는 것이 좋습니다."
        },
        {
          heading: "핵심 포인트 2",
          body: "배경/맥락을 덧붙이고, 공동체에 주는 의미를 연결하면 전달력이 높아집니다."
        },
        {
          heading: "실천 포인트",
          body: "이번 주에 실제로 적용할 수 있는 한 가지 행동을 짧게 제안해 보세요."
        }
      ],
      links: [
        { label: "원문 기사 링크", url: "https://example.com/article-1" },
        { label: "관련 기사 링크", url: "https://example.com/article-2" }
      ],
      attachments: [
        {
          label: "첨부 PDF 보기",
          url: "https://example.com/weekly-brief-2026-04-16.pdf"
        }
      ]
    },
    {
      id: "2026-04-09",
      dateLabel: "2026.04.09 (목)",
      title: "지난 주 기사 정리",
      summary: "지난 주 리포트 예시입니다. 같은 형식으로 계속 쌓아가면 됩니다.",
      coverImage:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop",
      sections: [
        {
          heading: "요약",
          body: "매주 새 항목을 위에 추가하면, 자동으로 최신 글이 메인에 표시됩니다."
        }
      ],
      links: [{ label: "원문", url: "https://example.com/old-article" }],
      attachments: []
    }
  ]
};
