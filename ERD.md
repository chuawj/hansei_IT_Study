# 한세대학교 수강신청 연습 시스템 - 기술명세서

## 1. 목적 및 개요

- 본 시스템은 한세대학교 학생들이 실제 수강신청 환경과 유사하게 연습할 수 있도록 하는 웹 기반 모의 수강신청 플랫폼이다.
- 실습용으로, 실제 수강신청과는 무관하며, 데이터는 브라우저 localStorage에 저장된다.

---

## 2. 주요 기능

### 2.1. 공통
- HTML/CSS/JS 파일 분리(모듈화)
- 모든 데이터는 localStorage에 저장(서버 연동 없음)
- 반응형 UI(데스크탑 기준, 모바일 대응은 선택)

### 2.2. 탭/페이지 구성
- 공지사항
- 교과목조회
- 예비수강신청(장바구니)
- 수강신청
- 수강내역 조회

### 2.3. 수강신청/예비수강신청
- 과목 검색(학부/학과/이수구분/과목명/코드 등)
- 장바구니(예비수강신청) 추가/삭제
- 실제 수강신청 추가/삭제
- 빠른 수강신청(코드 입력)
- 신청/삭제 시 토스트 알림

### 2.4. 대기열(Queue) 기능
- 수강신청 탭 진입/신청 시 대기열 모달 노출(ON/OFF 가능)
- 대기 인원/시간 랜덤 표시(1~100명, 1~10초)
- 대기열 ON/OFF 토글(index.html에서만, localStorage 연동)
- 대기열 상태 실시간 동기화(storage 이벤트 활용)

### 2.5. 타이머 기능
- 수강신청 오픈 타이머(시/분/초 설정)
- 타이머가 끝나면 수강신청 탭 활성화

---

## 3. 데이터 구조 및 저장 방식

### 3.1. 과목 마스터(subjects)
- js/data.js에 하드코딩된 배열
- 필드: code, name, dept, major, year, type, credit, cap, prof

### 3.2. 학부/학과/전공(categoryData)
- js/data.js에 하드코딩된 배열
- category(학부), depts(학부목록), majors(학과목록)

### 3.3. localStorage 구조
- basketList: 예비수강신청(장바구니) 목록, 과목 객체 배열
- registerList: 실제 수강신청 목록, 과목 객체 배열
- queueEnabled: 대기열 ON/OFF ('true'/'false')
- registerQueueRequired: 수강신청탭 진입 시 대기열 ('true'/'false')

---

## 4. 주요 화면 및 UI 요소

### 4.1. index.html (메인)
- 좌측: 타이머, 대기열 토글, 학교 로고
- 상단: 탭 메뉴(공지사항, 교과목조회, 예비수강신청, 수강신청, 수강내역 조회)
- 우측: 각 탭별 iframe(별도 html)

### 4.2. register.html (수강신청)
- 과목 검색/필터 UI
- 빠른 수강신청 입력란
- 개설과목 목록(테이블)
- 수강신청 내역(테이블)
- 대기열 모달(QueueModal)

### 4.3. basket.html (예비수강신청)
- 과목 검색/필터 UI
- 장바구니 목록(테이블)
- 장바구니 추가/삭제

---

## 5. 주요 JS 모듈 및 역할

- js/data.js: 과목/카테고리 마스터 데이터
- js/register.js: 수강신청 로직, 대기열, 테이블 렌더링, 신청/삭제
- js/basket.js: 예비수강신청 로직, 테이블 렌더링, 추가/삭제
- js/queue_modal.js: 대기열 모달 UI/제어
- js/queue_toggle.js: 대기열 ON/OFF 토글, localStorage 연동
- js/index.js: 탭 전환, 타이머, iframe 제어

---

## 6. 데이터 흐름 및 동기화

- 모든 신청/삭제/토글 등은 localStorage에 즉시 반영
- 대기열 토글은 storage 이벤트로 iframe 간 실시간 동기화
- 과목 데이터는 js/data.js에서만 관리(수정 불가)
- 신청/장바구니 목록은 localStorage에서만 관리

---

## 7. 예외/제약사항

- 학생 구분 없음(단일 사용자, 멀티 계정 미지원)
- 서버/DB 연동 없음(브라우저 localStorage만 사용)
- 새로고침 시 데이터 유지, 브라우저/기기 변경 시 데이터 유지 안 됨
- 실제 수강신청과는 무관(연습용)

---

## 8. 확장/변경 가능성

- 학생별 계정/로그인 추가 시 basketList/registerList에 student_id 필드 추가
- 서버 연동 시 REST API/DB 설계 필요
- 모바일 대응, 접근성 강화 등 UI/UX 개선 가능

---
# ERD (Entity-Relationship Diagram) - 한세대학교 수강신청 연습 시스템

아래는 실제 코드(localStorage 구조 포함)를 반영한 ERD입니다. 학생 구분 없이 단일 사용자 기준입니다.

---

```mermaid
erDiagram
  SUBJECT {
    string code PK
    string name
    string dept
    string major
    int year
    string type
    int credit
    int cap
    string prof
  }
  CATEGORYDATA {
    string category
    array depts
  }
  DEPT {
    string name
    array majors
  }
  BASKETLIST {
    array<Subject> basketList
  }
  REGISTERLIST {
    array<Subject> registerList
  }
  QUEUEENABLED {
    string queueEnabled
  }
  REGISTERQUEUEREQUIRED {
    string registerQueueRequired
  }

  CATEGORYDATA ||--o{ DEPT : contains
  BASKETLIST }|..|{ SUBJECT : includes
  REGISTERLIST }|..|{ SUBJECT : includes
  QUEUEENABLED ||--|| REGISTERLIST : controls
  QUEUEENABLED ||--|| BASKETLIST : controls
  REGISTERQUEUEREQUIRED ||--|| REGISTERLIST : triggers
```

---

## 로컬스토리지 구조 설명 및 예시

- **basketList**: 장바구니(예비수강신청) 목록, 과목 객체(subject) 배열
- **registerList**: 실제 수강신청 목록, 과목 객체(subject) 배열
- **queueEnabled**: 대기열 ON/OFF ('true' 또는 'false')
- **registerQueueRequired**: 수강신청탭 진입시 대기열 ('true' 또는 'false')

#### basketList, registerList 예시
```json
[
  {
    "code": "25103",
    "name": "IT학부세미나",
    "dept": "IT학부",
    "major": "IT학부",
    "year": 1,
    "type": "전공필수",
    "credit": 3,
    "cap": 30,
    "prof": "공삼공"
  }
]
```

#### queueEnabled, registerQueueRequired 예시
```json
"queueEnabled": "true"
"registerQueueRequired": "false"
```

---

이 다이어그램은 실제 코드(js/data.js, register.js, basket.js 등)와 localStorage 구조를 모두 반영합니다.
Mermaid.js를 지원하는 환경에서 바로 시각화할 수 있습니다.