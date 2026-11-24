// ============================================
// [정적 배포 변환] 원래 서버(games.json + Express API)가 하던 역할을
// 브라우저 안에서 대신한다. BASE_GAMES = 초기 전시 데이터,
// localStorage = 방문자별 추가/삭제 내역 저장소.
// ============================================
const BASE_GAMES = [
  {
    "id": "1",
    "title": "플래피버드",
    "category": "액션",
    "author": "김철수",
    "description": "새를 조종해 장애물을 피하는 게임",
    "overview": "클래식 플래피 버드 게임, 파이프 사이를 통과해야 함",
    "controls": "위 버튼: 위로 / 아래 버튼: 아래로",
    "difficulty": "보통",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "2",
    "title": "블록깨기",
    "category": "퍼즐",
    "author": "이영희",
    "description": "공으로 블록을 깨뜨리는 게임",
    "overview": "패들을 움직여 공을 튕겨 블록을 제거",
    "controls": "좌우 버튼: 패들 이동",
    "difficulty": "쉬움",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "3",
    "title": "미로탈출",
    "category": "어드벤처",
    "author": "박민수",
    "description": "미로를 탐험해 출구를 찾는 게임",
    "overview": "제한 시간 안에 미로를 탈출해야 함",
    "controls": "방향키: 이동",
    "difficulty": "어려움",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "4",
    "title": "우주침략자",
    "category": "슈팅",
    "author": "최지훈",
    "description": "외계인을 물리치는 슈팅 게임",
    "overview": "우주선을 조종해 적을 격추",
    "controls": "스페이스: 발사 / 방향키: 이동",
    "difficulty": "보통",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "6",
    "title": "좀비런",
    "category": "액션",
    "author": "오세훈",
    "description": "좀비를 피해 달리는 게임",
    "overview": "장애물을 피하며 최대한 오래 달리기",
    "controls": "스페이스: 점프 / 방향키: 이동",
    "difficulty": "어려움",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "7",
    "title": "기억력게임",
    "category": "퍼즐",
    "author": "장미경",
    "description": "같은 그림을 맞추는 카드 게임",
    "overview": "뒤집힌 카드를 기억해 같은 그림을 맞추는 방식",
    "controls": "클릭: 카드 뒤집기",
    "difficulty": "쉬움",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "8",
    "title": "낚시왕",
    "category": "시뮬레이션",
    "author": "윤호준",
    "description": "물고기를 잡는 낚시 게임",
    "overview": "다양한 물고기를 잡아 점수를 획득",
    "controls": "스페이스: 낚싯대 던지기 / 방향키: 조작",
    "difficulty": "보통",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "9",
    "title": "레이싱챌린지",
    "category": "스포츠",
    "author": "백승현",
    "description": "자동차 경주 게임",
    "overview": "트랙을 따라 빠르게 달려 1등을 목표",
    "controls": "방향키: 조향 / 스페이스: 가속",
    "difficulty": "어려움",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  },
  {
    "id": "10",
    "title": "요리마스터",
    "category": "캐주얼",
    "author": "한지민",
    "description": "재료를 조합해 요리를 만드는 게임",
    "overview": "제한 시간 안에 올바른 요리를 완성해야 함",
    "controls": "클릭: 재료 선택 / 드래그: 조합",
    "difficulty": "보통",
    "makeCodeUrl": "https://makecode.microbit.org/simulator"
  }
];

const STORE_KEY = "microbit-gallery-games";

// 저장된 내역이 있으면 그걸, 없으면 초기 데이터를 반환
function loadLocalGames() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* 시크릿 모드 등 저장소 불가 환경 */ }
  return JSON.parse(JSON.stringify(BASE_GAMES));
}

function saveLocalGames(games) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(games)); } catch (e) {}
}
