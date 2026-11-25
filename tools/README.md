# tools/ — 작업용 스크립트 보관 (사이트에는 안 보이게 막아 둠)

2026-11-25, Claude 작업 공간(/home/claude, /tmp)에만 있던 스크립트를 옮겨 둔 곳이에요.
API 키·비밀번호는 들어 있지 않아요(서버 함수는 `Deno.env.get(...)`으로만 읽음).

## skinbuild/ — 업종 화면 만들기·고치기
- `make_*.py`, `cfg_*.js`: 업종 화면(피부관리샵·학원·카페 등) 처음 만들 때 쓴 생성기. **이름 바꾸기(○○메이트 → 알아줌 + 업종) 전 기준**이라, 다시 쓰려면 이름·저장 키 치환부터 고쳐야 해요.
- `patch_*.py`: 8개 업종 화면(`skin nail hair pilates academy food cafe bakery`)을 한 번에 고치는 패치.
  - patch_pcig: 사진 보정 sticky 미리보기·PC 인스타 올리기
  - patch_toolgrid: 도구 그리드(가로 스크롤 없앰)·'홍보글 한 번에' 강조
  - patch_merge / patch_merge2: 사진 보정 + 홍보글 세트 한 화면
  - patch_album / patch_albfind: 작업실 앨범, 메뉴 이름으로 앨범 사진 자동 찾기
  - patch_trend: '이달 인기 형식' 박스
  - patch_hx: 홈페이지 제목 애니메이션
- `record*.py`, `v2.py`~`v7.py`, `edit_*.py`, `gen_canvas.py`: 실제 화면 녹화·릴스 영상 만들기(Playwright + ffmpeg)
- `icon.py`: 업종 아이콘 만들기

## edge-functions/ — Supabase 서버 함수 원본 (ref zuxbloxstkcixqpzqalk)
- `generate/index.ts` = 배포된 **v16**(이달 인기 형식 `trend` 포함)
- `photo-ai/`, `admin/`, `photo-test/`: 마지막으로 받아 둔 버전(배포본과 다를 수 있으니 배포 전 `get_edge_function`으로 확인)
- `review-reply`는 다른 대화창에서 만들어 여기 없음 → Supabase에서 받아 오기
- `family_stage1.sql`: 패밀리 1단계 DB 변경 기록

## qa-record/ — 확인·녹화용
- `qa_*.py`: 로컬 확인 스크립트. 저장소 폴더에서 `python3 -m http.server 8765` 띄우고 실행. Supabase 요청은 막고(mock) 화면만 봄
- `rec_intro.py`: 홈페이지 인트로(알 깨기) 영상 녹화 — 예전 커밋 8d81080의 인트로 블록 기준
- 그 밖: 아이콘·카드 이미지·서비스워커 확인 등

## 안드로이드 앱(구글 플레이)은 여기 없음
- 소스: 이 저장소 **`android-src` 브랜치**(TWA, 패키지 `com.alajoom.app`). push하면 GitHub Actions가 서명 안 된 .aab를 **`android-out` 브랜치**에 올림
- 스토어 스크린샷·대표 그래픽·카톡 공유 이미지: `android-src`의 `store/shots.js` → **`store-out` 브랜치**
- 서명 키(.jks)·비밀번호는 저장소에 **절대 올리지 않음** → 구글 드라이브 '알아줌' 폴더 '알아줌_앱_등록패키지_v2.zip'
