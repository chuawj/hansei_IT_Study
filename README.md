# HEllO heei_IT_study
---

## 🛠 1. 준비: 설치 및 설정

###  Git & VSCode 설치
- [Git 다운로드](https://git-scm.com/downloads)
- [VSCode 다운로드](https://code.visualstudio.com/)

###  Git 사용자 정보 설정
```bash
git config --global user.name "사용자이름"
git config --global user.email "이메일@example.com"
```

---

##  2. GitHub 계정 만들기 & 저장소 생성

1. [GitHub](https://github.com) 가입 및 로그인
2. 오른쪽 상단 `+` → **New repository**
3. 저장소 이름 입력 → `Create repository`

---

## 3. VSCode에서 GitHub 연동 & 파일 업로드

###  로컬 폴더 Git 초기화
```bash
git init
```

###  원격 저장소 연결
```bash
git remote add origin https://github.com/chuawj/hesei_IT_Study.git
```

###  파일 추가 & 커밋
```bash
git add .
git commit -m "처음 커밋"
```

### 브랜치 이름 변경 (GitHub 기본은 `main`)
```bash
git branch -M main
```

###  GitHub로 푸시
```bash
git push -u origin main
```

---

##  4. 브랜치 만들기 & 푸시

### 새 브랜치 생성 및 이동
```bash
git checkout -b feature/새기능
```

### 작업 후 커밋 & 푸시
```bash
git add .
git commit -m "새 기능 작업"
git push -u origin feature/새기능
```

---

##  Git 기초 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `git init` | Git 저장소 초기화 |
| `git clone [URL]` | 원격 저장소 복제 |
| `git status` | 변경사항 확인 |
| `git add .` | 모든 변경 파일 스테이징 |
| `git commit -m "메시지"` | 커밋 생성 |
| `git push` | 원격 저장소로 푸시 |
| `git pull` | 원격 저장소에서 가져오기 |
| `git branch` | 브랜치 목록 확인 |
| `git checkout -b [브랜치명]` | 새 브랜치 생성 및 이동 |

---

 참고 [이 블로그](https://velog.io/@blair-lee/VSCode%EC%97%90%EC%84%9C-Github-%EC%97%85%EB%A1%9C%EB%93%9C%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95%EC%A7%B1%EC%89%AC%EC%9B%80%E3%85%8B%E3%85%8B)는 VSCode에서 GitHub에 업로드하는 과정을 아주 쉽게 명함 확인 해보셈   

