// 모바일 내비게이션 토글
(function () {
  const btn = document.querySelector(".nav-toggle");
  const gnb = document.getElementById("gnb");
  if (!btn || !gnb) return;

  btn.addEventListener("click", () => {
    const open = gnb.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
})();


// 스크롤 리빌 — 대상 요소에 자동으로 클래스 부여 후 등장 감지
(function () {

  const targets = document.querySelectorAll(
    ".floor-head, .room, .about-band h2, .about-band p, " +
    ".section h2, .work-card, .photo-grid figure, .embed-card, .page-hero .container > *"
  );
  if (!("IntersectionObserver" in window) || targets.length === 0) return;

  targets.forEach((t) => t.classList.add("reveal"));

  // 형제끼리는 순차 등장 (최대 5단계 시차)
  const groups = new Map();
  targets.forEach((t) => {
    const key = t.parentElement;
    const n = groups.get(key) || 0;
    t.style.setProperty("--reveal-delay", `${Math.min(n, 5) * 0.08}s`);
    groups.set(key, n + 1);
  });

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((t) => io.observe(t));
})();

// 헤더 그림자
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();


// 히어로: 강조 단어 순환 (게임 → 건축물 → 로봇 → AI 작품)
(function () {
  const el = document.getElementById("cycleWord");
  if (!el) return;

  const words = [
    ["게임", "var(--room-game)"],
    ["건축물", "var(--room-mine)"],
    ["로봇", "var(--room-ham)"],
    ["AI 작품", "var(--room-ai)"],
  ];
  let i = 0;

  const setWord = () => {
    el.textContent = words[i][0];
    el.style.setProperty("--cycle-color", words[i][1]);
  };
  setWord();

  setInterval(() => {
    el.classList.add("swap");
    setTimeout(() => {
      i = (i + 1) % words.length;
      setWord();
      el.classList.remove("swap");
    }, 360);
  }, 2400);
})();

// 떠다니는 배경 도형 — 물리 시뮬레이션 (상호 충돌 + 마우스 타격)
(function () {
  const colors = [
    "var(--room-game)", "var(--room-mine)", "var(--room-phys)",
    "var(--room-code)", "var(--room-ham)", "var(--room-ai)",
  ];
  const shapes = [
    "fs-square", "fs-circle", "fs-triangle", "fs-plus", "fs-ring",
    "fs-diamond", "fs-star", "fs-hexagon", "fs-pill",
  ];

  // [left%, top%, size, 회전주기(s), 방향, 도형, 색번호]
  const FIELDS = {
    hero: [
      [5, 14, 26, 22, 1, 0, 0],  [13, 70, 18, 30, -1, 1, 1],
      [29, 9, 15, 18, 1, 2, 2],  [45, 80, 22, 26, -1, 3, 3],
      [57, 7, 16, 34, 1, 4, 4],  [71, 64, 30, 24, 1, 0, 5],
      [84, 20, 18, 20, -1, 2, 0],[92, 72, 24, 28, 1, 1, 2],
      [23, 42, 11, 16, -1, 3, 4],[66, 34, 12, 21, 1, 4, 5],
      [9, 44, 14, 36, -1, 2, 3], [38, 26, 20, 27, 1, 4, 1],
      [52, 58, 13, 19, -1, 3, 0],[78, 44, 15, 31, 1, 1, 5],
      [96, 40, 12, 23, -1, 0, 4],[34, 90, 16, 25, 1, 2, 5],
      [18, 22, 13, 24, 1, 5, 2], [62, 18, 17, 29, -1, 6, 0],
      [88, 52, 14, 21, 1, 7, 3], [42, 66, 19, 33, -1, 8, 1],
      [7, 82, 12, 17, 1, 6, 4],  [27, 58, 16, 26, -1, 7, 5],
      [73, 82, 13, 22, 1, 5, 0], [94, 10, 15, 28, -1, 8, 2],
      [49, 36, 10, 15, 1, 6, 3], [33, 8, 12, 20, -1, 5, 4],
    ],
    floor: [
      [3, 10, 18, 26, 1, 1, 0],  [96, 14, 22, 30, -1, 0, 2],
      [2, 62, 14, 20, -1, 3, 4], [97, 66, 16, 24, 1, 2, 1],
      [8, 90, 20, 28, 1, 4, 5],  [92, 92, 13, 18, -1, 2, 3],
      [50, 3, 15, 32, -1, 0, 5], [30, 95, 12, 22, 1, 1, 4],
      [5, 35, 15, 23, 1, 6, 5],  [95, 40, 13, 27, -1, 5, 3],
      [12, 8, 12, 19, 1, 7, 1],  [88, 8, 14, 25, -1, 8, 0],
      [20, 80, 13, 21, 1, 5, 2], [80, 85, 15, 29, -1, 6, 4],
    ],
  };

  // 화면 폭에 비례한 배율 (1440px 기준, 최대 1.7배)
  const k = Math.min(1.7, Math.max(1, window.innerWidth / 1440));
  const worlds = [];

  document.querySelectorAll(".float-field").forEach((layer) => {
    const spots = FIELDS[layer.dataset.float];
    if (!spots) return;
    const host = layer.parentElement || layer;

    const parts = spots.map(([l, t, s0, spin, dir, shape, ci]) => {
      const size = Math.round(s0 * k);
      const el = document.createElement("span");
      el.className = shapes[shape] + " phys";
      el.style.width = size + "px";
      el.style.height = size + "px";
      if (shapes[shape] === "fs-ring") {
        el.style.setProperty("--ring-color", colors[ci]);
        el.style.borderWidth = Math.max(3, Math.round(size / 6)) + "px";
      } else {
        el.style.background = colors[ci];
      }
      layer.appendChild(el);
      const a = Math.random() * Math.PI * 2;
      return {
        el, lp: l / 100, tp: t / 100,
        r: size / 2, m: size * size,
        x: 0, y: 0, hx: 0, hy: 0,
        vx: Math.cos(a) * 14, vy: Math.sin(a) * 14,
        ang: Math.random() * 360,
        baseAv: (360 / spin) * dir,   // deg/s
        extraAv: 0,
        glow: 0,
      };
    });

    const w = {
      layer, host, parts, W: 0, H: 0,
      mx: -1e4, my: -1e4, mvx: 0, mvy: 0, mt: 0,
    };

    w.measure = () => {
      w.W = layer.offsetWidth;
      w.H = layer.offsetHeight;
      parts.forEach((p) => {
        p.hx = p.lp * w.W;
        p.hy = p.tp * w.H;
        if (p.x === 0 && p.y === 0) { p.x = p.hx; p.y = p.hy; }
        p.x = Math.min(Math.max(p.x, p.r), w.W - p.r);
        p.y = Math.min(Math.max(p.y, p.r), w.H - p.r);
      });
    };
    w.measure();
    window.addEventListener("resize", w.measure);

    host.addEventListener("pointermove", (e) => {
      const rc = layer.getBoundingClientRect();
      const nx = e.clientX - rc.left, ny = e.clientY - rc.top;
      const now = performance.now();
      if (w.mt) {
        const dt = Math.max(0.008, (now - w.mt) / 1000);
        w.mvx = (nx - w.mx) / dt;
        w.mvy = (ny - w.my) / dt;
      }
      w.mx = nx; w.my = ny; w.mt = now;
    });
    host.addEventListener("pointerleave", () => {
      w.mx = -1e4; w.my = -1e4; w.mvx = 0; w.mvy = 0; w.mt = 0;
    });

    worlds.push(w);
  });

  if (worlds.length === 0) return;

  const MOUSE_R = 52;       // 마우스 충돌 반경
  const REST = 0.92;        // 도형끼리 반발 계수
  const WALL_REST = 0.78;   // 벽 반발 계수

  let last = performance.now();

  function step(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt <= 0 || dt > 0.08) dt = 0.016;

    worlds.forEach((w) => {
      const ps = w.parts;
      const drag = Math.exp(-0.85 * dt);
      const avDecay = Math.exp(-1.6 * dt);
      const glowDecay = Math.exp(-2.6 * dt);
      const mSpeed = Math.min(2200, Math.hypot(w.mvx, w.mvy));

      // ----- 개별 운동 -----
      for (const p of ps) {
        // 홈 위치로 아주 약하게 복귀 + 무작위 흔들림
        p.vx += (p.hx - p.x) * 0.22 * dt + (Math.random() - 0.5) * 26 * dt;
        p.vy += (p.hy - p.y) * 0.22 * dt + (Math.random() - 0.5) * 26 * dt;
        p.vx *= drag; p.vy *= drag;

        // 마우스 타격: 커서 반경과 겹치면 커서 속도만큼 튕겨 나감
        const mdx = p.x - w.mx, mdy = p.y - w.my;
        const md = Math.hypot(mdx, mdy);
        const minD = p.r + MOUSE_R;
        if (md < minD && md > 0.001) {
          const nx = mdx / md, ny = mdy / md;
          const push = 240 + mSpeed * 0.75;
          const vn = p.vx * nx + p.vy * ny;
          if (vn < push) {
            p.vx += nx * (push - vn);
            p.vy += ny * (push - vn);
          }
          p.extraAv += (Math.random() - 0.5) * 540;
          p.glow = 1;
        }

        // 속도 상한
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 1000) { p.vx *= 1000 / sp; p.vy *= 1000 / sp; }
      }

      // ----- 도형끼리 충돌 -----
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i], b = ps[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy);
          const minD = a.r + b.r;
          if (d >= minD || d < 0.001) continue;
          const nx = dx / d, ny = dy / d;

          // 겹침 분리 (질량 반비례)
          const overlap = minD - d;
          const ima = 1 / a.m, imb = 1 / b.m, imSum = ima + imb;
          a.x -= nx * overlap * (ima / imSum);
          a.y -= ny * overlap * (ima / imSum);
          b.x += nx * overlap * (imb / imSum);
          b.y += ny * overlap * (imb / imSum);

          // 법선 방향 충격량 교환
          const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rvn < 0) {
            const jImp = -(1 + REST) * rvn / imSum;
            a.vx -= nx * jImp * ima; a.vy -= ny * jImp * ima;
            b.vx += nx * jImp * imb; b.vy += ny * jImp * imb;
            const kick = Math.min(360, Math.abs(jImp) * 0.004);
            a.extraAv -= kick * (Math.random() < 0.5 ? 1 : -1);
            b.extraAv += kick * (Math.random() < 0.5 ? 1 : -1);
            if (Math.abs(rvn) > 90) { a.glow = Math.max(a.glow, 0.7); b.glow = Math.max(b.glow, 0.7); }
          }
        }
      }

      // ----- 이동·벽 반사·렌더 -----
      for (const p of ps) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < p.r)        { p.x = p.r;        p.vx = Math.abs(p.vx) * WALL_REST; }
        if (p.x > w.W - p.r)  { p.x = w.W - p.r;  p.vx = -Math.abs(p.vx) * WALL_REST; }
        if (p.y < p.r)        { p.y = p.r;        p.vy = Math.abs(p.vy) * WALL_REST; }
        if (p.y > w.H - p.r)  { p.y = w.H - p.r;  p.vy = -Math.abs(p.vy) * WALL_REST; }

        p.extraAv *= avDecay;
        p.ang += (p.baseAv + p.extraAv) * dt;
        p.glow *= glowDecay;

        p.el.style.transform =
          "translate(" + (p.x - p.r).toFixed(1) + "px," + (p.y - p.r).toFixed(1) + "px) " +
          "rotate(" + p.ang.toFixed(1) + "deg)";
        p.el.style.opacity = (0.22 + p.glow * 0.3).toFixed(2);
      }

      // 마우스 속도는 매 프레임 감쇠 (멈춘 커서가 계속 밀지 않도록)
      w.mvx *= 0.8; w.mvy *= 0.8;
    });

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();

// 부드러운 스크롤 자체 엔진 — 브라우저·OS 설정과 무관하게 항상 동작
window.__smoothScroll = (function () {
  let rafId = 0;
  return function (targetY, duration) {
    if (rafId) cancelAnimationFrame(rafId);
    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 2) { window.scrollTo(0, targetY); return; }
    const dur = duration || Math.min(900, 450 + Math.abs(dist) * 0.25);
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, startY + dist * ease(t));
      rafId = t < 1 ? requestAnimationFrame(frame) : 0;
    };
    rafId = requestAnimationFrame(frame);
  };
})();

// 페이지 내 앵커(#) 이동도 자체 엔진으로 — 설정과 무관하게 부드럽게
(function () {
  const HEADER = 64;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER;
      window.__smoothScroll(top, 750);
      if (history.pushState) history.pushState(null, "", "#" + id);
    });
  });
})();

// 스크롤 스냅: 히어로 ↔ 전시관 안내 사이는 휠 한 번에 이동
(function () {
  const floor = document.getElementById("floor");
  const hero = document.querySelector(".hero");
  if (!floor || !hero) return;

  const HEADER = 64;
  let animating = false;

  const go = (top) => {
    animating = true;
    window.__smoothScroll(top, 700);
    setTimeout(() => { animating = false; }, 780);
  };

  window.addEventListener("wheel", (e) => {
    if (animating) { e.preventDefault(); return; }
    const floorTop = floor.getBoundingClientRect().top + window.scrollY - HEADER;
    const y = window.scrollY;

    // 히어로 구간에서 아래로 → 전시관 안내로 스냅
    if (e.deltaY > 0 && y < floorTop - 40) {
      e.preventDefault();
      go(floorTop);
    }
    // 전시관 안내 상단 근처에서 위로 → 히어로로 스냅
    else if (e.deltaY < 0 && y > 10 && y <= floorTop + 40) {
      e.preventDefault();
      go(0);
    }
  }, { passive: false });
})();
