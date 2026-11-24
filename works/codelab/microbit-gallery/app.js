// ============================================
// 1. 데이터 정의
// ============================================

let gamesData = [];

// DOMContentLoaded 안에서 서버에서 게임 데이터 로드
document.addEventListener("DOMContentLoaded", () => {
  // [정적 배포 변환] 서버 fetch 대신 로컬 데이터 사용 (data.js 참고)
  gamesData = loadLocalGames();

  // 앱 초기화
  initSelects(); // 드롭다운 리스트 json파일에서 추출
  renderListPage(); // 드롭다운 적용된 목록 페이지 렌더링

  document // 카테고리선택 드롭다운 이벤트 리스너 등록
    .getElementById("categorySelect")
    .addEventListener("change", (e) => {
      appState.selectedCategory = e.target.value;
      appState.selectedGameId = null;
      renderListPage();
    });
});
// ============================================
// 2. 상태 관리
// ============================================

const appState = {
  selectedGameId: null,
  selectedCategory: "",
  currentPage: "list",
  isAdmin: false,
};

// ============================================
// 4. 필터링 및 데이터 함수
// ============================================

/**
 * 필터 조건에 맞는 게임들 반환
 */
function getFilteredGames() {
  return gamesData.filter((game) => {
    const categoryMatch =
      appState.selectedCategory === "" ||
      game.category === appState.selectedCategory;
    return categoryMatch;
  });
}

/**
 * 모든 카테고리 추출
 */
function getCategories() {
  return [...new Set(gamesData.map((g) => g.category))].sort();
}

/**
 * ID로 게임 찾기
 */
function getGameById(id) {
  return gamesData.find((g) => g.id === id);
}

// ============================================
// 5. 페이지 관리 함수
// ============================================

/**
 * 목록 페이지로 이동
 */
function goToList() {
  appState.currentPage = "list";
  appState.selectedGameId = null;
  document.getElementById("listPage").classList.add("active");
  document.getElementById("detailPage").classList.remove("active");
  document.getElementById("breadcrumb-text").style.display = "none";
}

/**
 * 상세 페이지로 이동
 */
function goToDetail(gameId) {
  appState.currentPage = "detail";
  appState.selectedGameId = gameId;
  document.getElementById("listPage").classList.remove("active");
  document.getElementById("detailPage").classList.add("active");
  document.getElementById("breadcrumb-text").style.display = "block";
  renderDetailPage();
}

// ============================================
// 6. 렌더링 함수
// ============================================

/**
 * 드롭다운 초기화
 */
function initSelects() {
  const categorySelect = document.getElementById("categorySelect");
  getCategories().forEach((category) => {
    const opt = document.createElement("option");
    opt.value = category;
    opt.textContent = category;
    categorySelect.appendChild(opt);
  });

  categorySelect.value = appState.selectedCategory;
}

/**
 * 목록 페이지 렌더링
 */
function renderListPage() {
  const grid = document.getElementById("gamesGrid");
  const addGameSection = document.getElementById("add-gamecard");

  // 어드민 상태에 따라 게임 추가 버튼 표시/숨김
  if (appState.isAdmin) {
    addGameSection.style.display = "flex";
  } else {
    addGameSection.style.display = "none";
  }

  const games = getFilteredGames();

  grid.innerHTML = "";

  if (games.length === 0) {
    grid.innerHTML =
      '<div class="empty-state"><p>검색 결과가 없습니다</p></div>';
    return;
  }

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.onclick = () => goToDetail(game.id);

    // 관리자일 때만 삭제 버튼 추가
    if (appState.isAdmin) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "game-card-delete";
      deleteBtn.title = "게임 삭제";
      deleteBtn.textContent = "×";
      card.appendChild(deleteBtn);
    }

    // 제목
    const title = document.createElement("div");
    title.className = "game-card-title";
    title.textContent = game.title;
    card.appendChild(title);

    // 메타 정보 (작성자)
    const meta1 = document.createElement("div");
    meta1.className = "game-card-meta";

    const authorSpan = document.createElement("span");
    authorSpan.textContent = `👤 ${game.author}`;
    meta1.appendChild(authorSpan);

    card.appendChild(meta1);

    // 카테고리
    const category = document.createElement("div");
    category.className = "game-card-category";
    category.textContent = game.category;
    card.appendChild(category);

    // 설명
    const meta2 = document.createElement("div");
    meta2.className = "game-card-meta";
    meta2.style.marginTop = "8px";

    const descSpan = document.createElement("span");
    descSpan.style.color = "#666";
    descSpan.style.fontSize = "0.85em";
    descSpan.textContent = game.description;
    meta2.appendChild(descSpan);

    if (appState.isAdmin) {
      const deleteBtn = card.querySelector(".game-card-delete");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteGame(game.id);
      });
    }

    grid.appendChild(card);
  });
}

/**
 * 상세 페이지 렌더링
 */
function renderDetailPage() {
  const game = getGameById(appState.selectedGameId);
  if (!game) return;

  // 브레드크럼
  document.getElementById("breadcrumb-game").textContent = game.title;

  // 게임 정보
  document.getElementById("detail-title").textContent = game.title;
  const categoryBadge = document.getElementById("detail-category-badge");
  categoryBadge.replaceChildren();
  const categoryElement = document.createElement("span");
  categoryElement.className = "game-card-category";
  categoryElement.textContent = game.category;
  categoryBadge.appendChild(categoryElement);

  document.getElementById("detail-author").textContent = game.author;
  document.getElementById("detail-description").textContent = game.description;

  // 게임 상세
  document.getElementById("detail-overview").textContent = game.overview;
  document.getElementById("detail-controls").textContent = game.controls;
  document.getElementById("detail-difficulty").textContent = game.difficulty;

  // 시뮬레이터
  document.getElementById("simulator-iframe").src = game.makeCodeUrl;
}
/**
 * 관리자 페이지 접근 함수 - 모달 열기
 */
function accessAdmin() {
  if (appState.isAdmin) {
    // 어드민 상태면 로그아웃
    appState.isAdmin = false;
    renderListPage();
    alert("로그아웃되었습니다.");
    return;
  }
  // 어드민이 아니면 로그인 모달 표시
  document.getElementById("adminModal").classList.add("active");
  document.getElementById("adminPassword").value = "";
  document.getElementById("adminPassword").focus();
}

/**
 * 관리자 로그인 함수
 */
function loginAdmin() {
  const password = document.getElementById("adminPassword").value;
  if (password === "admin123") {
    appState.isAdmin = true;
    closeAdminModal();
    renderListPage();
    alert("관리자 모드가 활성화되었습니다.");
  } else {
    alert("비밀번호가 틀렸습니다.");
    document.getElementById("adminPassword").value = "";
    document.getElementById("adminPassword").focus();
  }
}

/**
 * 관리자 모달 닫기
 */
function closeAdminModal() {
  document.getElementById("adminModal").classList.remove("active");
  document.getElementById("adminPassword").value = "";
}

/**
 * 게임 추가 함수 - 모달 열기
 */
function addGameCard() {
  document.getElementById("gameForm").reset();
  document.getElementById("gameModal").classList.add("active");
}

/**
 * 게임 추가 제출 함수
 */
function submitNewGame(event) {
  event.preventDefault();

  // 폼 데이터 수집
  const newGame = {
    title: document.getElementById("gameTitle").value,
    category: document.getElementById("gameCategory").value,
    author: document.getElementById("gameAuthor").value,
    description: document.getElementById("gameDescription").value,
    overview: document.getElementById("gameOverview").value,
    controls: document.getElementById("gameControls").value,
    difficulty: document.getElementById("gameDifficulty").value,
    makeCodeUrl: document.getElementById("gameMakeCodeUrl").value,
  };

  // [정적 배포 변환] 서버 POST 대신 브라우저 저장소에 직접 추가
  // (서버 코드의 ID 생성 규칙 "최대 ID + 1"을 그대로 유지)
  const maxId =
    gamesData.length > 0 ? Math.max(...gamesData.map((g) => Number(g.id))) : 0;
  newGame.id = String(maxId + 1);

  gamesData.push(newGame);
  saveLocalGames(gamesData);

  closeGameModal();
  renderListPage();
  alert("게임이 성공적으로 추가되었습니다. (이 브라우저에만 저장됩니다)");
}

/**
 * 게임 추가 모달 닫기
 */
function closeGameModal() {
  document.getElementById("gameModal").classList.remove("active");
  document.getElementById("gameForm").reset();
}

/**
 * 게임 삭제 함수 - 서버(json)에서 삭제 후 목록 재로드
 */
function deleteGame(gameId) {
  const game = getGameById(gameId);
  if (!game) return;
  if (!confirm(`"${game.title}" 게임을 삭제하시겠습니까?`)) return;

  // [정적 배포 변환] 서버 DELETE 대신 브라우저 저장소에서 직접 삭제
  gamesData = gamesData.filter((g) => String(g.id) !== String(gameId));
  saveLocalGames(gamesData);
  renderListPage();
  alert("게임이 성공적으로 삭제되었습니다. (이 브라우저에만 반영됩니다)");
}
