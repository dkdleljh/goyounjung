# 고윤정 아카이브

https://dkdleljh.github.io/goyounjung/

고윤정의 프로필·작품·인터뷰·화보·일정과 위키 기록을 읽고 검색하는 비공식 팬 아카이브입니다. Astro 정적 사이트이며, 원본은 [goyoonjung-wiki](https://github.com/dkdleljh/goyoonjung-wiki)입니다.

## 개발

Node.js 24 이상을 권장합니다.

```sh
npm ci
git clone --depth 1 https://github.com/dkdleljh/goyoonjung-wiki.git .wiki
npm run dev
```

기존 위키를 사용하려면 `WIKI_DIR=/absolute/path/to/goyoonjung-wiki npm run dev`로 실행합니다. 경로는 `/goyounjung/`입니다.

```sh
npm test
npm run build
npm run check:links
npm run preview
# 별도 터미널에서 실제 브라우저 기능 검증
npx playwright install chromium
npm run test:browser
```

## 동기화와 배포

- 사이트 main 변경 / 수동 실행 / 6시간 주기(`47 */6 * * *`, UTC)에 위키 main을 체크아웃해 빌드합니다.
- 수집 호스트는 위키 게시 후 이 워크플로의 수동 실행을 요청합니다. 별도 토큰을 사이트에 보관하지 않습니다.
- 문서 제목, 본문, 출처 링크와 작품 데이터는 빌드 때 원본에서 읽습니다. 이 저장소에 위키 내용을 복제하여 수동 관리하지 않습니다.
- 원본의 `pages/`, `sources/`, `news/` Markdown을 서비스합니다(작성용 templates/checklists 제외). JSON에서 작품 목록과 프로필 요약을 생성합니다.
- 검색은 브라우저에서 동작하며 서버나 방문자 계정이 필요하지 않습니다.
- 본문의 상대 링크는 홈페이지 문서로 바꿉니다. 비공개 설정/코드 경로를 배포하지 않으며 아카이브 밖 문서는 원본 GitHub 링크로 연결합니다. 임의 HTML은 실행하지 않습니다.
- 원본 Markdown이 변경되면 사이트도 다음 빌드에 갱신됩니다. 잘못된 자료는 원본 위키에서 수정하세요.
- 테스트·빌드·내부 링크 검사 실패 시 Pages 배포를 수행하지 않아 기존 사이트가 유지됩니다.
- `sync.json`은 위키·사이트 커밋, 모든 공개 원본의 SHA-256, 빌드 시각과 마지막 수집 결과를 제공합니다. `artifact-manifest.json`은 HTML·검색 색인·CSS 등 배포 파일의 해시를 제공합니다. 배포 작업은 실제 공개 파일을 전수 대조한 뒤 성공으로 종료합니다. 수집 실패/부분성공을 새 빌드 성공으로 덮어쓰지 않습니다.
- 수집 호스트의 별도 15분 타이머가 게시를 재시도합니다. [동기화 운영 문서](https://github.com/dkdleljh/goyoonjung-wiki/blob/main/docs/website-sync.md)에 검증 명령과 충돌 처리 기준이 있습니다.
- GitHub 예약 작업은 지연될 수 있으며 60일간 활동이 없는 공개 저장소에서는 중지될 수 있습니다. 필요하면 Actions에서 다시 활성화하세요.

이 저장소는 사진을 재배포하지 않으며, 위키에 수록된 이미지도 원본 링크로 제공합니다. 제목·요약과 원문 출처를 중심으로 탐색합니다. 배우·소속사와 무관한 비공식 팬 사이트입니다.
