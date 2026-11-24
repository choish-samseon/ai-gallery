// ============================================
// 작품 팝업 갤러리 (전시관 공용)
// 사용법: 페이지에서 window.WORKS 배열을 정의하고
//        renderWorkGallery("컨테이너 선택자")를 호출
// ============================================

function renderWorkGallery(gridSelector) {
  const grid = document.querySelector(gridSelector);
  const works = window.WORKS || [];
  if (!grid || works.length === 0) return;

  // ----- 카드 생성 -----
  works.forEach((work, idx) => {
    const card = document.createElement("button");
    card.className = "work-card";
    card.type = "button";
    card.setAttribute("aria-haspopup", "dialog");
    const hasImg = work.images && work.images.length > 0;
    const thumbHtml = hasImg
      ? `<img src="${work.images[0]}" alt="${work.title} 대표 사진" loading="lazy">`
      : `<span class="thumb-play" aria-hidden="true">${work.embed ? "▶" : "🖼"}</span>`;
    const n = (work.images || []).length;
    const badge = work.embed
      ? `<span class="work-count">${work.badge || "플레이 가능"}</span>`
      : `<span class="work-count">${n > 0 ? `사진 ${n}장` : "준비 중"}</span>`;
    card.innerHTML = `
      <div class="work-thumb${hasImg ? "" : " no-img"}">
        ${thumbHtml}
        ${badge}
      </div>
      <div class="work-body">
        <p class="work-title">${work.title}</p>
        ${work.author ? `<p class="work-author">${work.author}</p>` : ""}
        <p class="work-intent">${work.intent}</p>
      </div>`;
    card.addEventListener("click", () => openModal(idx));
    grid.appendChild(card);
  });

  // ----- 모달 생성 -----
  const modal = document.createElement("div");
  modal.className = "gallery-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="gm-panel">
      <div class="gm-head">
        <div>
          <p class="gm-title"></p>
          <p class="gm-author"></p>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <a class="gm-open-new" href="#" target="_blank" rel="noopener" hidden>크게 보기 ↗</a>
          <button class="gm-close" aria-label="닫기">✕</button>
        </div>
      </div>
      <div class="gm-stage">
        <img alt="">
        <div class="gm-embed" hidden><iframe title="" allowfullscreen allow="autoplay; fullscreen; gamepad"></iframe></div>
        <button class="gm-nav gm-prev" aria-label="이전 사진">←</button>
        <button class="gm-nav gm-next" aria-label="다음 사진">→</button>
        <span class="gm-counter"></span>
      </div>
      <p class="gm-controls" hidden></p>
      <p class="gm-intent"></p>
    </div>`;
  document.body.appendChild(modal);

  const el = {
    title: modal.querySelector(".gm-title"),
    author: modal.querySelector(".gm-author"),
    img: modal.querySelector(".gm-stage img"),
    embed: modal.querySelector(".gm-embed"),
    iframe: modal.querySelector(".gm-embed iframe"),
    counter: modal.querySelector(".gm-counter"),
    intent: modal.querySelector(".gm-intent"),
    controls: modal.querySelector(".gm-controls"),
    prev: modal.querySelector(".gm-prev"),
    next: modal.querySelector(".gm-next"),
    close: modal.querySelector(".gm-close"),
    openNew: modal.querySelector(".gm-open-new"),
  };

  let current = 0;   // 현재 작품 인덱스
  let photo = 0;     // 현재 사진 인덱스
  let lastFocus = null;

  function showPhoto() {
    const w = works[current];
    if (!w.images || w.images.length === 0) {
      el.img.style.display = "none";
      el.counter.textContent = "사진 준비 중";
      el.prev.style.display = "none";
      el.next.style.display = "none";
      return;
    }
    el.img.src = w.images[photo];
    el.img.alt = `${w.title} 사진 ${photo + 1}`;
    el.counter.textContent = `${photo + 1} / ${w.images.length}`;
    const single = w.images.length <= 1;
    el.prev.style.display = single ? "none" : "";
    el.next.style.display = single ? "none" : "";
  }

  function openModal(idx) {
    current = idx;
    photo = 0;
    const w = works[idx];
    el.title.textContent = w.title;
    el.author.textContent = w.author || "";
    el.author.style.display = w.author ? "" : "none";
    const desc = (w.details !== undefined) ? w.details : w.intent;
    el.intent.textContent = desc;
    el.intent.style.display = desc ? "" : "none";
    el.controls.hidden = !w.controls;
    el.controls.textContent = w.controls ? "🎮 " + w.controls : "";
    modal.classList.toggle("has-embed", !!w.embed);
    el.openNew.hidden = !w.embed;
    if (w.embed) el.openNew.href = w.embed;
    if (w.embed) {
      el.img.style.display = "none";
      el.counter.style.display = "none";
      el.prev.style.display = "none";
      el.next.style.display = "none";
      el.embed.hidden = false;
      el.iframe.src = w.embed;
      el.iframe.title = w.title;
    } else if ((w.images || []).length > 0) {
      el.img.style.display = "";
      el.counter.style.display = "";
      el.embed.hidden = true;
      el.iframe.src = "about:blank";
      showPhoto();
    } else {
      // 사진이 아직 없는 작품: 무대 없이 소개만
      el.img.style.display = "none";
      el.counter.style.display = "none";
      el.prev.style.display = "none";
      el.next.style.display = "none";
      el.embed.hidden = true;
      el.iframe.src = "about:blank";
    }
    lastFocus = document.activeElement;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    el.close.focus();
  }

  function closeModal() {
    el.iframe.src = "about:blank";
    modal.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  const move = (dir) => {
    const n = works[current].images.length;
    photo = (photo + dir + n) % n;
    showPhoto();
  };

  el.prev.addEventListener("click", () => move(-1));
  el.next.addEventListener("click", () => move(1));
  el.close.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });
}
