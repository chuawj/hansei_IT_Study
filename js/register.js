document.addEventListener('DOMContentLoaded', function() {
  // 간결한 단일 파일 구현: 카테고리, 이수구분(버튼), 학부/학과 필터, 검색, 신청/삭제
  function getBasket() { return JSON.parse(localStorage.getItem('basketList')||'[]'); }
  function getRegister() { return JSON.parse(localStorage.getItem('registerList')||'[]'); }
  function setRegister(list) { localStorage.setItem('registerList', JSON.stringify(list)); }

  // 학기 정보 가져오기: localStorage에서만 가져오기 (더 안정적)
  let currentSemester = localStorage.getItem('currentSemester') || '2';


  function applySemester(sem) {
    currentSemester = sem || '2';
   
    const basketOption = document.getElementById('basket-option');
    if (basketOption) {
      if (currentSemester === '1') {
        try { basketOption.hidden = true; } catch(e) { basketOption.style.display = 'none'; }
        // 만약 현재 선택이 예비수강이면 강제 변경
        if (categorySelect && categorySelect.value === 'basket') {
          categorySelect.value = 'major';
          categorySelect.dispatchEvent(new Event('change'));
        }
      } else {
        try { basketOption.hidden = false; basketOption.removeAttribute('style'); } catch(e) { basketOption.style.display = ''; }
        try { const t = document.getElementById('toast'); if (t) { t.classList.remove('show'); t.textContent = ''; } } catch(e){}
        try {
          if (typeof categorySelect !== 'undefined' && categorySelect) {
            categorySelect.value = 'basket';
            categorySelect.dispatchEvent(new Event('change'));
          }
        } catch (e) { /* ignore auto-select failure */ }
      }
    }
  }


  const categorySelect = document.getElementById('category-select');
  const deptSelect = document.getElementById('dept-select');
  const majorSelect = document.getElementById('major-select');
  const typeButtons = document.getElementById('type-buttons');
  const typeSelect = document.getElementById('type-select');
  const majorArea = document.getElementById('major-area');
  const subjectNameSelect = document.getElementById('subject-name-select');
  const subjectSearchArea = document.getElementById('subject-search-area');

  let currentTypeValue = '';

  window.addEventListener('storage', function(e) {
    if (e.key === 'currentSemester') {
      applySemester(e.newValue || '2');
    }
  });

  window.addEventListener('message', function(ev) {
    try {
      const d = ev.data || {};
      if (d && d.type === 'semester-changed') {
        const sem = String(d.value || '2');
        applySemester(sem);
      }
    } catch (err) { /* ignore malformed messages */ }
  });

  // DOM이 준비되면 초기 적용 (학기별 UI 적용 포함)
  // 전체 UI 비활성화는 하지 않으므로 관련 함수 호출을 제거
  setTimeout(function(){ 
    applySemester(currentSemester);
    // 페이지 로드 시 테이블 비우기
    const tbody = document.getElementById('reg-list');
    if(tbody) tbody.innerHTML = '';
  }, 0);

  // 이수구분 버튼(버튼형) 클릭 처리 — 요소가 존재할 때만 바인딩
  const typeButtonEls = document.querySelectorAll('.type-button');
  if (typeButtonEls && typeButtonEls.length) {
    typeButtonEls.forEach(btn => {
      btn.addEventListener('click', function() {
        typeButtonEls.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentTypeValue = this.dataset.value || '';
        const isMajorType = ['전공필수','전공선택','전공기초'].includes(currentTypeValue);
        majorArea.style.display = isMajorType ? 'flex' : 'none';
        if (subjectNameSelect) subjectNameSelect.style.display = isMajorType ? '' : 'none';
        if (isMajorType) updateDeptOptions();
      });
    });
  }

  // 드롭다운 방식 이수구분이 있으면 onchange 연결 (원래 디자인 유지)
  if (typeSelect) {
    typeSelect.onchange = function() {
      currentTypeValue = typeSelect.value || '';
      const isMajorType = ['전공필수','전공선택','전공기초'].includes(currentTypeValue);
      majorArea.style.display = isMajorType ? 'flex' : 'none';
      if (subjectNameSelect) subjectNameSelect.style.display = isMajorType ? '' : 'none';
      if (isMajorType) updateDeptOptions();
      // 조회는 '조회' 버튼으로 실행됩니다 (자동 조회 비활성화)
    };
  }

  // 보조: 만약 typeSelect에 값이 바뀌면, 버튼형이 있는 경우 버튼 상태 초기화
  if (typeSelect) {
    typeSelect.addEventListener('change', function(){
      if (typeButtonEls && typeButtonEls.length) typeButtonEls.forEach(b=>b.classList.remove('active'));
    });
  }

  function updateDeptOptions() {
    deptSelect.innerHTML = '';
    const allOption = document.createElement('option'); allOption.value=''; allOption.textContent='전체'; deptSelect.appendChild(allOption);
    (categoryData||[]).forEach(cat => cat.depts.forEach(d => {
      const opt = document.createElement('option'); opt.value = d.name; opt.textContent = d.name; deptSelect.appendChild(opt);
    }));
    updateMajorOptions();
    // update subject name select to reflect new dept/major options
    try { fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || ''); } catch(e) {}
  }

  function updateMajorOptions() {
    majorSelect.innerHTML = '';
    const allOption = document.createElement('option'); allOption.value=''; allOption.textContent='전체'; majorSelect.appendChild(allOption);
    if (!deptSelect.value) return;
    (categoryData||[]).forEach(cat => cat.depts.forEach(d => {
      if (d.name === deptSelect.value) d.majors.forEach(m => {
        const opt = document.createElement('option'); opt.value = m; opt.textContent = m; majorSelect.appendChild(opt);
      });
    }));
  }

  deptSelect.onchange = function() { updateMajorOptions(); try { fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || ''); } catch(e){} };
  majorSelect.onchange = function() { try { fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || ''); } catch(e){} };

  function fillSubjectListSelect() {
    const select = document.getElementById('subject-list-select'); if(!select) return;
    select.innerHTML = '';
    const nameSelect = document.getElementById('subject-name-select'); if (nameSelect) nameSelect.innerHTML = '';
    (subjects||[]).forEach(subj => {
      const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; select.appendChild(opt);
      if (nameSelect) {
        const opt2 = document.createElement('option'); opt2.value = subj.code; opt2.textContent = `${subj.name} [${subj.code}]`; nameSelect.appendChild(opt2);
      }
    });
  }

  // Populate subject-name-select with optional filters for dept/major
  function fillSubjectNameSelect(filterDept, filterMajor) {
    const nameSelect = document.getElementById('subject-name-select'); if (!nameSelect) return;
    nameSelect.innerHTML = '';
    const list = (subjects||[]).filter(s => {
      if (filterDept && filterDept !== '' && s.dept !== filterDept) return false;
      if (filterMajor && filterMajor !== '' && s.major !== filterMajor) return false;
      return true;
    });
    // add an empty option for '전체'
    const allOpt = document.createElement('option'); allOpt.value = ''; allOpt.textContent = '전체'; nameSelect.appendChild(allOpt);
    list.forEach(subj => {
      const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; nameSelect.appendChild(opt);
    });
  }

  categorySelect.onchange = function() {
    // 1학기에서 예비수강 선택 시도 방지
    if (currentSemester === '1' && categorySelect.value === 'basket') {
      Toast.show('1학기에는 예비수강신청 기능을 사용할 수 없습니다.');
      categorySelect.value = 'major';
      categorySelect.onchange.call(categorySelect);
      return;
    }

    // 초기화
    majorArea.style.display = 'none';
    if (typeButtons) typeButtons.style.display = 'none';
    if (typeSelect) typeSelect.style.display = 'none';
    if (subjectNameSelect) subjectNameSelect.style.display = 'none';
    subjectSearchArea.style.display = 'none';
    // 초기화: 버튼형/셀렉트형 이수구분 상태 초기화
    if (typeButtonEls && typeButtonEls.length) typeButtonEls.forEach(b=>b.classList.remove('active'));
    if (typeSelect) typeSelect.value = '';
    currentTypeValue = '';

    if (categorySelect.value === 'basket') {
      majorArea.style.display = 'none';
      subjectSearchArea.style.display = 'none';
      if (typeButtons) typeButtons.style.display = 'none';
      renderTable();
    } else if (categorySelect.value === 'major') {
      majorArea.style.display = 'flex'; if (subjectNameSelect) subjectNameSelect.style.display = '';
      updateDeptOptions();
    } else if (categorySelect.value === 'subject') {
      subjectSearchArea.style.display = 'inline-flex'; fillSubjectListSelect();
    } else if (categorySelect.value === 'type') {
      if (typeSelect) typeSelect.style.display = '';
      else if (typeButtons) typeButtons.style.display = 'flex';
    }
  };

  document.getElementById('search-btn').onclick = renderTable;

  // 입력 필드 변경은 내부 상태만 변경. 조회는 버튼 클릭으로 수행됩니다.
  if (document.getElementById('subject-code-input')) document.getElementById('subject-code-input').onkeyup = function(e){ /* no-op */ };
  if (document.getElementById('subject-list-select')) document.getElementById('subject-list-select').onchange = function() { /* no-op */ };
  if (subjectNameSelect) subjectNameSelect.onchange = function(e){ /* no-op */ };

  function renderTable() {
    let filtered = [];
    const cat = categorySelect.value;
    if (cat === 'basket') {
      filtered = getBasket();
    } else if (cat === 'major') {
      const dept = (deptSelect||{}).value || '';
      const major = (majorSelect||{}).value || '';
      filtered = (subjects||[]).filter(s => (!dept || s.dept===dept) && (!major || s.major===major));
      const selectedCode = subjectNameSelect && subjectNameSelect.value;
      if (selectedCode) filtered = filtered.filter(s => s.code === selectedCode);
    } else if (cat === 'subject') {
      const codeInput = (document.getElementById('subject-code-input')||{}).value || '';
      const selectCode = (document.getElementById('subject-list-select')||{}).value || '';
      if (codeInput) filtered = (subjects||[]).filter(s => s.code.includes(codeInput));
      else if (selectCode) filtered = (subjects||[]).filter(s => s.code === selectCode);
      else filtered = subjects || [];
    } else if (cat === 'type') {
      filtered = subjects||[];
      if (currentTypeValue) filtered = filtered.filter(s => s.type === currentTypeValue);
      if (['전공필수','전공선택','전공기초'].includes(currentTypeValue)) {
        const dept = deptSelect.value, major = majorSelect.value;
        if (dept) filtered = filtered.filter(s => s.dept === dept);
        if (major) filtered = filtered.filter(s => s.major === major);
      }
    }

    const tbody = document.getElementById('reg-list'); if(!tbody) return;
    tbody.innerHTML = '';
    filtered.forEach((s,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap!==undefined? s.cap : ''}</td><td><button class='btn apply'>신청</button></td>`;
      tr.querySelector('.apply').onclick = function(){ QueueModal.showApply(()=> addToRegister(s)); };
      tbody.appendChild(tr);
    });
  }

  function addToRegister(subject) {
    let list = getRegister();
    const dup = list.find(s => s.code === subject.code && (!subject.section || s.section === subject.section));
    if (dup) { Toast.show('이미 신청된 과목입니다.'); return; }
    list.push(subject); setRegister(list);
    let basket = getBasket(); basket = basket.filter(s=>s.code!==subject.code); localStorage.setItem('basketList', JSON.stringify(basket));
    renderTable(); renderRegisterTable(); Toast.show('신청되었습니다.');
  }

  function removeFromRegister(code) { let list = getRegister(); list = list.filter(s=>s.code!==code); setRegister(list); renderRegisterTable(); }

  function renderRegisterTable() {
    const list = getRegister(); const tbody = document.querySelector('#my-reg tbody'); if(!tbody) return; tbody.innerHTML = '';
    list.forEach((s,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap!==undefined?s.cap:30}</td><td><button class='btn del'>삭제</button></td>`;
      tr.querySelector('.del').onclick = function(){ removeFromRegister(s.code); };
      tbody.appendChild(tr);
    });
  }

  const quickApplyBtn = document.getElementById('quick-apply-btn');
  if (quickApplyBtn) quickApplyBtn.onclick = function(){
    // 사용자가 과목코드와 분반을 입력하도록 요구하되, 분반은 반드시 '001'이어야 함
    const rawCode = (document.getElementById('quick-code')||{}).value.trim() || '';
    const sectionInput = (document.getElementById('quick-section')||{}).value.trim() || '';
    if (!rawCode) return Toast.show('과목코드를 입력하세요.');
    if (!sectionInput) return Toast.show("분반을 입력하세요. (예: 001)");
    if (sectionInput !== '001') return Toast.show("분반은 '001'로 입력해야 합니다.");
    // 과목코드는 숫자 부분만 취함 (하이픈 포함 입력도 허용하지만 분반은 위에서 검사)
    const codeMatch = rawCode.match(/^([0-9]{4,6})/);
    if (!codeMatch) return Toast.show('과목코드 형식이 올바르지 않습니다. (예: 15905)');
    const code = codeMatch[1];
    const subj = (subjects||[]).find(s => s.code === code);
    if(!subj) return Toast.show('해당 과목코드의 과목이 없습니다.');
    let list = getRegister(); if(list.find(s=>s.code===code && (s.section === sectionInput))) { Toast.show('이미 신청된 과목입니다.'); return; }
    QueueModal.showApply(()=>{ const newSubj = Object.assign({}, subj); newSubj.section = sectionInput; list.push(newSubj); setRegister(list); renderTable(); renderRegisterTable(); Toast.show('신청되었습니다.'); });
  };

  // 초기화 및 진입
  // 1학기인 경우 basket 선택 방지
  if (currentSemester === '1' && categorySelect.value === 'basket') {
    categorySelect.value = 'major';
  }
  // populate subject selects so major/subject views have the options
  try { fillSubjectListSelect(); } catch (e) { }
  categorySelect.dispatchEvent(new Event('change'));
  QueueModal.showEnter(function(){ renderTable(); renderRegisterTable(); });
});