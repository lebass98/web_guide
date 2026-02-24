# WebTools - 프리미엄 개발자 유틸리티 🛠️

WebTools는 웹 개발자, 디자이너, 그리고 IT 전문가들이 일상적으로 반복하는 작업들을 빠르고 직관적으로 처리할 수 있도록 돕는 **무료 올인원 웹 유틸리티 서비스**입니다. 최신 웹 기술과 우아한 UI/UX(Glassmorphism)를 결합하여 "단순한 기능"을 넘어 "즐거운 사용 경험"을 제공하는 데 집중했습니다.

## 🌟 주요 기능 (Features)

현재 제공되는 10가지 이상의 핵심 도구는 다음과 같습니다:

1. 🎨 **CSS 그라데이션 생성기 (Advanced)**
   - 시각적인 그라데이션 바(Timeline)와 양방향 2D 컬러 피커 지원.
   - 드래그 & 드롭으로 색상 정지점(Color stop) 추가/이동 및 실시간 CSS 코드 생성.
2. 🌈 **CSS 그라데이션 배경 갤러리**
   - 영감을 주는 20+ 개의 큐레이팅된 아름다운 CSS 그라데이션 프리셋 제공.
   - 클릭 한 번으로 CSS 배경 코드 클립보드 복사.
3. 🖌️ **색상 변환기 (Color Converter)**
   - HEX, RGB, HSL 포맷 간의 양방향 실시간 변환 지원.
4. 📝 **JSON 포매터 (JSON Formatter)**
   - 복잡하고 압축된 JSON 데이터를 보기 좋게 정렬(Beautify)하거나 압축(Minify).
   - 실시간 문법 유효성 검사(Validation) 기능 포함.
5. 🔣 **HTML 특수문자 변환기**
   - 텍스트 내의 특수 기호를 안전한 HTML Entity 문자로 인코딩/디코딩.
6. 🔠 **텍스트 변환기 (Text Transformer)**
   - 대소문자 변환, 단어 수 세기, 공백 제거, 텍스트 치환 등 텍스트 가공.
7. 🔐 **Base64 변환기**
   - 문자열 데이터를 Base64 형식으로 빠르게 인코딩 및 디코딩.
8. 🔗 **URL 인코더 (URL Encoder/Decoder)**
   - URL 매개변수를 안전하게 전송하기 위한 인코딩 및 디코딩 기능.
9. 📱 **QR 코드 생성기**
   - URL이나 텍스트를 입력하면 즉석에서 스캔 가능한 QR 코드로 변환 및 다운로드.
10. ⏱️ **타임스탬프 변환기 (Timestamp Converter)**
    - Unix 에포크 시점(Epoch time)을 사람이 읽을 수 있는 날짜/시간 포맷으로 변환.

## 🚀 기술 스택 (Tech Stack)

본 프로젝트는 최첨단 현대 웹 생태계를 기반으로 구축되었습니다:
- **Framework**: [Next.js](https://nextjs.org/) (App Router 기반)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: 기능성에 초점을 맞춘 커스텀 Glassmorphism 스타일 및 다크 테마/라이트 테마 가변 대응.
- **Color Picker**: [react-colorful](https://github.com/omgovich/react-colorful) (빠르고 가벼운 컬러 픽커)
- **Deployment**: **GitHub Pages** (Static HTML Export + GitHub Actions 자동화)

## 📦 설치 및 실행 방법 (Installation & Getting Started)

이 프로젝트를 로컬 환경에서 실행하려면 Node.js(v18 이상 권장)가 필요합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/lebass98/web_guide.git
cd web_guide

# 2. 의존성 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

터미널에서 서버가 성공적으로 실행되면 브라우저를 열고 [http://localhost:3000](http://localhost:3000) 로 접속하세요.

## 🌐 GitHub Pages 배포 (Deployment)

이 프로젝트는 `.github/workflows/deploy.yml` 설정을 통해 GitHub Actions로 **완전 자동화된 배포**를 지원합니다.

1. 로컬에서 변경된 코드를 `main` 브랜치에 Push (`git push origin main`)
2. GitHub 서버가 변경 사항을 감지하고 `next build` (output: 'export' 설정에 의한 정적 사이트 렌더링)
3. 빌드된 정적 결과물(`out/`)이 자동으로 GitHub Pages 환경으로 배포됩니다.
4. **접속 가능 URL**: `https://lebass98.github.io/web_guide` (GitHub Pages 옵션 활성화 후 구동됩니다.)

*(참고: `next.config.ts` 파일 내에 `basePath: '/web_guide'`가 알맞게 설정되어 있어 하위 경로 에셋 깨짐 현상이 방지되어 있습니다.)*

## 🤝 라이선스 (License)

이 프로젝트는 오픈소스로 누구나 자유롭게 참고하고 활용할 수 있습니다. 
Happy Coding! 🎉
