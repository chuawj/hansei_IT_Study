document.addEventListener('DOMContentLoaded', function() {
  // 간결한 단일 파일 구현: 카테고리, 이수구분(버튼), 학부/학과 필터, 검색, 신청/삭제
  function getBasket() { return JSON.parse(localStorage.getItem('basketList')||'[]'); }
  function getRegister() { return JSON.parse(localStorage.getItem('registerList')||'[]'); }
  function setRegister(list) { localStorage.setItem('registerList', JSON.stringify(list)); }

  const categorySelect = document.getElementById('category-select');
  const deptSelect = document.getElementById('dept-select');
  const majorSelect = document.getElementById('major-select');
  const typeButtons = document.getElementById('type-buttons');
  const typeSelect = document.getElementById('type-select');
  const majorArea = document.getElementById('major-area');
  const subjectKeyword = document.getElementById('subject-keyword');
  const subjectSearchArea = document.getElementById('subject-search-area');

  let currentTypeValue = '';

  // 이수구분 버튼 클릭 처리
  document.querySelectorAll('.type-button').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.type-button').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentTypeValue = this.dataset.value || '';
      const isMajorType = ['전공필수','전공선택','전공기초'].includes(currentTypeValue);
      majorArea.style.display = isMajorType ? 'flex' : 'none';
      subjectKeyword.style.display = isMajorType ? '' : 'none';
      if (isMajorType) updateDeptOptions();
      // 조회는 '조회' 버튼으로 실행됩니다 (자동 조회 비활성화)
    });
  });

  // 드롭다운 방식 이수구분이 있으면 onchange 연결 (원래 디자인 유지)
  if (typeSelect) {
    typeSelect.onchange = function() {
      currentTypeValue = typeSelect.value || '';
      const isMajorType = ['전공필수','전공선택','전공기초'].includes(currentTypeValue);
      majorArea.style.display = isMajorType ? 'flex' : 'none';
      subjectKeyword.style.display = isMajorType ? '' : 'none';
      if (isMajorType) updateDeptOptions();
      // 조회는 '조회' 버튼으로 실행됩니다 (자동 조회 비활성화)
    };
  }

  function updateDeptOptions() {
    deptSelect.innerHTML = '';
    const allOption = document.createElement('option'); allOption.value=''; allOption.textContent='전체'; deptSelect.appendChild(allOption);
    (categoryData||[]).forEach(cat => cat.depts.forEach(d => {
      const opt = document.createElement('option'); opt.value = d.name; opt.textContent = d.name; deptSelect.appendChild(opt);
    }));
    updateMajorOptions();
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

  deptSelect.onchange = function() { updateMajorOptions(); };
  majorSelect.onchange = function() { /* 조회는 버튼으로 수행 */ };

  function fillSubjectListSelect() {
    const select = document.getElementById('subject-list-select'); if(!select) return;
    select.innerHTML = '';
    (subjects||[]).forEach(subj => { const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; select.appendChild(opt); });
  }

  categorySelect.onchange = function() {
  // 초기화
  majorArea.style.display = 'none';
  if (typeButtons) typeButtons.style.display = 'none';
  if (typeSelect) typeSelect.style.display = 'none';
    subjectKeyword.style.display = 'none';
    subjectSearchArea.style.display = 'none';
    document.querySelectorAll('.type-button').forEach(b=>b.classList.remove('active'));
    currentTypeValue = '';

    if (categorySelect.value === 'major') {
      majorArea.style.display = 'flex'; subjectKeyword.style.display = '';
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
  if (subjectKeyword) subjectKeyword.onkeyup = function(e){ /* no-op */ };

  function renderTable() {
    let filtered = [];
    const cat = categorySelect.value;
    if (cat === 'basket') {
      filtered = getBasket();
    } else if (cat === 'major') {
      const dept = deptSelect.value, major = majorSelect.value;
      filtered = (subjects||[]).filter(s => (!dept || s.dept===dept) && (!major || s.major===major));
      const kw = subjectKeyword && subjectKeyword.value.trim().toLowerCase();
      if (kw) filtered = filtered.filter(s => (s.name||'').toLowerCase().includes(kw) || (s.code||'').includes(kw));
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
    const val = (document.getElementById('quick-code')||{}).value || '';
    if(!val) return Toast.show('과목코드-분반을 입력하세요.');
    const m = val.match(/^([0-9]{4,6})(?:-(\d{1,2}))?$/);
    if(!m) return Toast.show('형식: 과목코드-분반 (예:15905 또는 15905-1)');
    const code = m[1], section = m[2] || '';
    const subj = (subjects||[]).find(s => s.code === code);
    if(!subj) return Toast.show('해당 과목코드의 과목이 없습니다.');
    let list = getRegister(); if(list.find(s=>s.code===subj.code && (!section || s.section===section))) { Toast.show('이미 신청된 과목입니다.'); return; }
    QueueModal.showApply(()=>{ if(section) subj.section = section; list.push(subj); setRegister(list); renderTable(); renderRegisterTable(); Toast.show('신청되었습니다.'); });
  };

  // 초기화 및 진입
  categorySelect.dispatchEvent(new Event('change'));
  QueueModal.showEnter(function(){ renderTable(); renderRegisterTable(); });
});