(function initWriter() {
  const generateBtn = document.getElementById("generate");
  const copyBtn = document.getElementById("copy");
  const snippetEl = document.getElementById("snippet");

  if (!generateBtn || !copyBtn || !snippetEl) return;

  generateBtn.addEventListener("click", () => {
    const galleryImages = parseImageLines(getValue("galleryImages"));
    const manualCoverImage = getValue("coverImage");

    const weekObject = {
      id: getValue("id"),
      dateLabel: getValue("dateLabel"),
      title: getValue("title"),
      summary: getValue("summary"),
      coverImage: manualCoverImage || (galleryImages[0] ? galleryImages[0].url : ""),
      galleryImages,
      articleText: getValue("articleText"),
      links: parsePairLines(getValue("links")),
      serviceOrder: parseServiceOrder(getValue("serviceOrderRaw")),
      events: parseEvents(getValue("eventsRaw")),
      attachments: parsePairLines(getValue("attachments"))
    };

    const cleaned = removeEmptyFields(weekObject);
    const snippet = `${JSON.stringify(cleaned, null, 2)},`;
    snippetEl.textContent = snippet;
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

function parsePairLines(rawText) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("|").map((chunk) => chunk.trim());
      return {
        label: label || "링크",
        url: url || ""
      };
    })
    .filter((entry) => entry.url);
}

function parseImageLines(rawText) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [caption, url] = line.split("|").map((chunk) => chunk.trim());
      if (!url && caption) {
        return { caption: "", url: caption };
      }
      return {
        caption: caption || "",
        url: url || ""
      };
    })
    .filter((entry) => entry.url);
}

function parseServiceOrder(rawText) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
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

function parseEvents(rawText) {
  const blocks = rawText
    .replaceAll("\r\n", "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const event = {
      title: "",
      date: "",
      place: "",
      target: "",
      description: "",
      apply: "",
      contact: "",
      extra: []
    };

    lines.forEach((line, index) => {
      const [rawKey, ...rest] = line.split(":");
      if (rest.length === 0) {
        if (index === 0 && !event.title) event.title = line;
        else event.extra.push(line);
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

    if (!event.title) event.title = "행사 안내";
    return event;
  });
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
      return;
    }
  });

  return result;
}
