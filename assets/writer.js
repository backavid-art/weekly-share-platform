(function initWriter() {
  const generateBtn = document.getElementById("generate");
  const copyBtn = document.getElementById("copy");
  const snippetEl = document.getElementById("snippet");

  if (!generateBtn || !copyBtn || !snippetEl) return;

  generateBtn.addEventListener("click", () => {
    const weekObject = {
      id: getValue("id"),
      dateLabel: getValue("dateLabel"),
      title: getValue("title"),
      summary: getValue("summary"),
      coverImage: getValue("coverImage"),
      articleText: getValue("articleText"),
      links: parsePairLines(getValue("links")),
      attachments: parsePairLines(getValue("attachments"))
    };

    const snippet = `${JSON.stringify(weekObject, null, 2)},`;
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
