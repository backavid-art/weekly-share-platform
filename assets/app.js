(function init() {
  const data = window.WEEKLY_CONTENT;

  if (!data || !Array.isArray(data.weeks) || data.weeks.length === 0) {
    renderEmpty();
    return;
  }

  const titleEl = document.getElementById("site-title");
  const introEl = document.getElementById("site-intro");
  const contactEl = document.getElementById("site-contact");

  titleEl.textContent = data.siteTitle || "주간 기사 공유";
  introEl.textContent = data.intro || "";
  contactEl.textContent = data.contact || "";

  let currentId = data.weeks[0].id;

  renderArchive(data.weeks, currentId, onPickWeek);
  renderWeek(findWeekById(data.weeks, currentId));

  function onPickWeek(id) {
    currentId = id;
    renderArchive(data.weeks, currentId, onPickWeek);
    renderWeek(findWeekById(data.weeks, currentId));
  }
})();

function findWeekById(weeks, id) {
  return weeks.find((week) => week.id === id) || weeks[0];
}

function renderWeek(week) {
  const dateEl = document.getElementById("current-week-date");
  const detailEl = document.getElementById("current-week");

  dateEl.textContent = week.dateLabel || "";

  const sectionsHtml = (week.sections || [])
    .map(
      (section) => `
      <section class="section-block">
        <h4>${escapeHtml(section.heading || "")}</h4>
        <p>${escapeHtml(section.body || "")}</p>
      </section>
    `
    )
    .join("");

  const articleTextHtml = renderArticleText(week.articleText || "");

  const linksHtml = (week.links || [])
    .map(
      (link) => `<li><a href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(
        link.label || "링크"
      )}</a></li>`
    )
    .join("");

  const attachmentsHtml = (week.attachments || [])
    .map(
      (file) => `<li><a href="${escapeAttr(file.url)}" target="_blank" rel="noreferrer">${escapeHtml(
        file.label || "첨부 파일"
      )}</a></li>`
    )
    .join("");

  detailEl.innerHTML = `
    ${
      week.coverImage
        ? `<img class="hero-image" src="${escapeAttr(week.coverImage)}" alt="${escapeAttr(week.title || "주간 이미지")}" />`
        : ""
    }
    <h3>${escapeHtml(week.title || "제목 없음")}</h3>
    <p class="week-summary">${escapeHtml(week.summary || "")}</p>
    ${articleTextHtml}
    ${sectionsHtml}
    ${linksHtml ? `<h4>참고 링크</h4><ul class="link-list">${linksHtml}</ul>` : ""}
    ${attachmentsHtml ? `<h4>첨부 자료</h4><ul class="attachment-list">${attachmentsHtml}</ul>` : ""}
  `;
}

function renderArticleText(articleText) {
  const normalized = String(articleText).replaceAll("\r\n", "\n").trim();
  if (!normalized) return "";

  const blocks = normalized.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return "";

      const isBulletBlock = lines.every((line) => line.startsWith("- "));
      if (isBulletBlock) {
        const items = lines
          .map((line) => `<li>${escapeHtml(line.slice(2).trim())}</li>`)
          .join("");
        return `<ul class="article-bullets">${items}</ul>`;
      }

      if (lines[0].startsWith("## ")) {
        const heading = escapeHtml(lines[0].slice(3).trim());
        const body = lines
          .slice(1)
          .map((line) => escapeHtml(line))
          .join("<br>");
        return `<section class="section-block"><h4 class="article-heading">${heading}</h4>${
          body ? `<p class="article-paragraph">${body}</p>` : ""
        }</section>`;
      }

      const paragraph = lines.map((line) => escapeHtml(line)).join("<br>");
      return `<p class="article-paragraph">${paragraph}</p>`;
    })
    .join("");
}

function renderArchive(weeks, currentId, onPick) {
  const listEl = document.getElementById("archive-list");

  listEl.innerHTML = weeks
    .map(
      (week) => `
      <button
        type="button"
        class="archive-item ${week.id === currentId ? "active" : ""}"
        data-week-id="${escapeAttr(week.id)}"
      >
        <p class="date">${escapeHtml(week.dateLabel || "")}</p>
        <p class="title">${escapeHtml(week.title || "제목 없음")}</p>
      </button>
    `
    )
    .join("");

  listEl.querySelectorAll(".archive-item").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-week-id");
      if (id) onPick(id);
    });
  });
}

function renderEmpty() {
  const current = document.getElementById("current-week");
  const archive = document.getElementById("archive-list");
  current.innerHTML = "<p>표시할 주간 데이터가 없습니다. content/weeks.js를 확인하세요.</p>";
  archive.innerHTML = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
