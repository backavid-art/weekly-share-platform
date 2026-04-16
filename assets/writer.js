(function initWriter() {
  const generateBtn = document.getElementById("generate");
  const copyBtn = document.getElementById("copy");
  const snippetEl = document.getElementById("snippet");

  if (!generateBtn || !copyBtn || !snippetEl) return;

  generateBtn.addEventListener("click", () => {
    const newsRaw = getValue("newsRaw");
    const bulletinRaw = getValue("bulletinRaw");

    const news = parseNewsRaw(newsRaw);
    const bulletin = parseBulletinRaw(bulletinRaw);
    const dateInfo = makeDateInfo(bulletin.dateLabelRaw);

    const weekObject = {
      id: dateInfo.id,
      dateLabel: dateInfo.dateLabel,
      title: news.title || bulletin.title || "이번 주 소식 및 주보",
      summary: news.summary || "이번 주 주요 소식과 예배 안내를 정리했습니다.",
      coverImage: news.coverImage || (news.galleryImages[0] ? news.galleryImages[0].url : ""),
      galleryImages: news.galleryImages,
      articleText: news.articleText,
      links: news.links,
      serviceOrder: bulletin.serviceOrder,
      events: bulletin.events,
      bulletinSections: bulletin.bulletinSections
    };

    const cleaned = removeEmptyFields(weekObject);
    snippetEl.textContent = `${JSON.stringify(cleaned, null, 2)},`;
  });

  copyBtn.addEventListener("click", async () => {
    const text = snippetEl.textContent || "";
    if (!text || text === "아직 생성된 코드가 없습니다.") return;

    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "복사 완료";
      window.setTimeout(() => {
        copyBtn.textContent = "코드 복사";
      }, 1400);
    } catch {
      copyBtn.textContent = "복사 실패";
      window.setTimeout(() => {
        copyBtn.textContent = "코드 복사";
      }, 1400);
    }
  });
})();

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function parseNewsRaw(rawText) {
  const lines = rawText.replaceAll("\r\n", "\n").split("\n");

  const galleryImages = [];
  const links = [];
  const textLines = [];

  let title = "";
  let coverImage = "";

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      textLines.push("");
      return;
    }

    const lower = trimmed.toLowerCase();

    if (lower.startsWith("제목:")) {
      title = trimmed.slice(3).trim();
      return;
    }

    if (lower.startsWith("대표이미지:") || lower.startsWith("cover:")) {
      coverImage = trimmed.split(":").slice(1).join(":").trim();
      return;
    }

    if (lower.startsWith("사진:")) {
      const url = trimmed.split(":").slice(1).join(":").trim();
      if (url) galleryImages.push({ caption: "", url });
      return;
    }

    if (lower.startsWith("링크:")) {
      const value = trimmed.split(":").slice(1).join(":").trim();
      const pair = parsePairLine(value);
      if (pair) links.push(pair);
      return;
    }

    const imageUrl = extractImageUrl(trimmed);
    if (imageUrl) {
      galleryImages.push({ caption: "", url: imageUrl });
      return;
    }

    if (isLikelyUrl(trimmed)) {
      links.push({ label: "참고 링크", url: trimmed });
      return;
    }

    textLines.push(trimmed);
  });

  const cleanText = textLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!title) {
    const firstTextLine = cleanText.split("\n").find((line) => line.trim());
    if (firstTextLine) title = firstTextLine.length > 46 ? `${firstTextLine.slice(0, 46)}...` : firstTextLine;
  }

  const summary = makeSummary(cleanText);

  return {
    title,
    summary,
    coverImage,
    galleryImages,
    articleText: cleanText,
    links
  };
}

function parseBulletinRaw(rawText) {
  const normalized = rawText.replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");

  let title = "";
  let dateLabelRaw = "";
  const sections = [];
  let current = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) current.lines.push("");
      return;
    }

    if (!title && index === 0 && !trimmed.includes(":")) {
      title = trimmed;
    }

    if (!dateLabelRaw) {
      const dateMatch = trimmed.match(/(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}[^\n]*)/);
      if (dateMatch) dateLabelRaw = dateMatch[1].trim();
    }

    if (isBulletinHeader(trimmed)) {
      current = { title: normalizeHeader(trimmed), lines: [] };
      sections.push(current);
      return;
    }

    if (!current) {
      current = { title: "주보 안내", lines: [] };
      sections.push(current);
    }

    current.lines.push(trimmed);
  });

  const serviceSection = sections.find((section) => section.title.includes("예배 순서"));
  const serviceOrder = serviceSection ? parseServiceOrderFromLines(serviceSection.lines) : [];

  const eventSection = sections.find((section) => section.title.includes("교회 소식") || section.title.includes("행사"));
  const events = eventSection ? parseEventsFromLines(eventSection.lines) : [];

  const bulletinSections = sections
    .filter((section) => section.lines.some((line) => line.trim()))
    .map((section) => ({
      title: section.title,
      lines: section.lines.filter((line) => line.trim())
    }));

  return {
    title,
    dateLabelRaw,
    serviceOrder,
    events,
    bulletinSections
  };
}

function isBulletinHeader(text) {
  const cleaned = text.replace(/[\[\]()]/g, "").trim();
  const known = [
    "예배 순서",
    "예배안내",
    "성도의 교제",
    "지난 주 헌금",
    "교회 소식",
    "교우 동정",
    "교우동정",
    "중보기도 제목",
    "중보기도",
    "교회력",
    "주중 모임"
  ];

  if (known.some((header) => cleaned.includes(header))) return true;

  return /순서|안내|헌금|소식|동정|교제|기도|교회력/.test(cleaned) && cleaned.length <= 20;
}

function normalizeHeader(text) {
  return text.replace(/[\[\]()]/g, "").replace(/\s+/g, " ").trim();
}

function parseServiceOrderFromLines(lines) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /\|/.test(line) || /^([0-2]?\d:[0-5]\d)/.test(line))
    .map((line) => {
      const chunks = line.split("|").map((chunk) => chunk.trim());

      if (chunks.length >= 3) {
        return { time: chunks[0], title: chunks[1], person: chunks.slice(2).join(" | ") };
      }

      if (chunks.length === 2) {
        return { time: "", title: chunks[0], person: chunks[1] };
      }

      const timeMatch = line.match(/^([0-2]?\d:[0-5]\d)\s*(.+)$/);
      if (timeMatch) {
        return { time: timeMatch[1], title: timeMatch[2], person: "" };
      }

      return { time: "", title: line, person: "" };
    });
}

function parseEventsFromLines(lines) {
  const cleanedLines = lines.map((line) => line.trim()).filter(Boolean);

  const blocks = [];
  let current = [];

  cleanedLines.forEach((line) => {
    const isNewBlock = /^\d+[.)]/.test(line) || /^행사명\s*:/.test(line);
    if (isNewBlock && current.length > 0) {
      blocks.push(current);
      current = [];
    }
    current.push(line);
  });

  if (current.length > 0) blocks.push(current);

  return blocks.map((rows) => {
    const event = {
      title: rows[0].replace(/^\d+[.)]\s*/, "") || "행사 안내",
      date: "",
      place: "",
      target: "",
      description: "",
      apply: "",
      contact: "",
      extra: []
    };

    rows.forEach((row) => {
      const clean = row.replace(/^\d+[.)]\s*/, "").trim();
      const [rawKey, ...rest] = clean.split(":");

      if (rest.length === 0) {
        if (clean !== event.title) event.extra.push(clean);
        return;
      }

      const key = rawKey.trim();
      const value = rest.join(":").trim();

      if (["행사명", "제목", "행사"].includes(key)) event.title = value;
      else if (["일시", "날짜", "시간"].includes(key)) event.date = value;
      else if (["장소", "위치"].includes(key)) event.place = value;
      else if (["대상", "참석대상"].includes(key)) event.target = value;
      else if (["내용", "소개", "설명"].includes(key)) event.description = value;
      else if (["신청", "신청방법", "접수"].includes(key)) event.apply = value;
      else if (["문의", "문의처", "연락"].includes(key)) event.contact = value;
      else event.extra.push(`${key}: ${value}`);
    });

    return event;
  });
}

function makeDateInfo(rawDateLabel) {
  if (rawDateLabel) {
    const match = rawDateLabel.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (match) {
      const yyyy = match[1];
      const mm = match[2].padStart(2, "0");
      const dd = match[3].padStart(2, "0");
      return {
        id: `${yyyy}-${mm}-${dd}`,
        dateLabel: rawDateLabel
      };
    }
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return {
    id: `${yyyy}-${mm}-${dd}`,
    dateLabel: `${yyyy}.${mm}.${dd} (${weekdays[now.getDay()]})`
  };
}

function parsePairLine(value) {
  const chunks = value.split("|").map((chunk) => chunk.trim());
  if (chunks.length >= 2 && chunks[1]) {
    return { label: chunks[0] || "참고 링크", url: chunks.slice(1).join(" | ") };
  }

  if (isLikelyUrl(value)) {
    return { label: "참고 링크", url: value };
  }

  return null;
}

function extractImageUrl(line) {
  const imageMatch = line.match(/(https?:\/\/\S+\.(?:jpg|jpeg|png|webp|gif))/i);
  if (imageMatch) return imageMatch[1];

  const localMatch = line.match(/(\.\/\S+\.(?:jpg|jpeg|png|webp|gif))/i);
  if (localMatch) return localMatch[1];

  return "";
}

function isLikelyUrl(text) {
  return /^https?:\/\//i.test(text);
}

function makeSummary(articleText) {
  const plain = articleText.replaceAll("\n", " ").replace(/\s+/g, " ").trim();
  if (!plain) return "";
  if (plain.length <= 68) return plain;
  return `${plain.slice(0, 68)}...`;
}

function removeEmptyFields(objectValue) {
  const result = {};

  Object.entries(objectValue).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) result[key] = value;
      return;
    }

    if (typeof value === "string") {
      if (value.trim() !== "") result[key] = value;
      return;
    }

    if (value && typeof value === "object") {
      result[key] = value;
    }
  });

  return result;
}
