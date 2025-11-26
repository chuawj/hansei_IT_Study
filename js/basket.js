window.onload = function() {
  // 학기 변경에 따라 UI를 즉시 활성/비활성화하는 로직
  function disableBasketUI(showToast) {
    console.log('[basket] disableBasketUI called, showToast=', !!showToast);
    if (showToast && typeof Toast !== 'undefined') Toast.show('1학년 1학기에는 예비수강신청 기능을 사용할 수 없습니다.');
    document.querySelectorAll('select, input, button').forEach(el => {
      if (el.id !== 'toast') {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.cursor = 'not-allowed';
      }
    });
    document.querySelectorAll('table').forEach(table => {
      table.style.opacity = '0.5';
      table.style.pointerEvents = 'none';
    });
  }

  function enableBasketUI() {
    console.log('[basket] enableBasketUI called');
    try { const t = document.getElementById('toast'); if (t) { t.classList.remove('show'); t.textContent = ''; } } catch(e){}
    document.querySelectorAll('select, input, button').forEach(el => {
      if (el.id !== 'toast') {
        el.disabled = false;
        el.style.opacity = '';
        el.style.cursor = '';
      }
    });
    document.querySelectorAll('table').forEach(table => {
      table.style.opacity = '';
      table.style.pointerEvents = '';
    });
  }

  let initialized = false;
  function initBasket() {
    if (initialized) return; initialized = true;

    const categorySelect = document.getElementById('category-select');
    const deptSelect = document.getElementById('dept-select');
    const majorSelect = document.getElementById('major-select');
    const typeSelect = document.getElementById('type-select');
    const majorArea = document.getElementById('major-area');

    function updateDeptOptions() {
      deptSelect.innerHTML = '';
      (categoryData||[]).forEach(cat => {
        (cat.depts||[]).forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.name; opt.textContent = d.name;
          deptSelect.appendChild(opt);
        });
      });
      updateMajorOptions();
    }
    function updateMajorOptions() {
      majorSelect.innerHTML = '';
      let found = false;
      (categoryData||[]).forEach(cat => {
        (cat.depts||[]).forEach(d => {
          if (d.name === deptSelect.value) {
            (d.majors||[]).forEach(m => {
              const opt = document.createElement('option'); opt.value = m; opt.textContent = m; majorSelect.appendChild(opt);
            });
            found = true;
          }
        });
      });
      if (!found) {
        const opt = document.createElement('option'); opt.value = ''; opt.textContent = '전체'; majorSelect.appendChild(opt);
      }
    }
    deptSelect.onchange = updateMajorOptions;
    updateDeptOptions();

    function populateTypeOptions() {
      typeSelect.innerHTML = '';
      const preferred = ['전공필수','전공선택','전공기초','교양필수','교양선택','채플','연계필수','연계선택'];
      const typesSet = new Set((subjects||[]).map(s => s.type).filter(Boolean));
      const types = Array.from(typesSet);
      const optAll = document.createElement('option'); optAll.value = ''; optAll.textContent = '전체'; typeSelect.appendChild(optAll);
      preferred.forEach(p => {
        if (typesSet.has(p)) {
          const opt = document.createElement('option'); opt.value = p; opt.textContent = p; typeSelect.appendChild(opt);
          const idx = types.indexOf(p); if (idx !== -1) types.splice(idx,1);
          typesSet.delete(p);
        }
      });
      types.sort();
      types.forEach(t => { const opt = document.createElement('option'); opt.value = t; opt.textContent = t; typeSelect.appendChild(opt); });
    }
    populateTypeOptions();

    if (typeSelect) {
      typeSelect.onchange = function() {
        const val = typeSelect.value || '';
        const isMajorType = ['전공필수','전공선택','전공기초'].includes(val);
        majorArea.style.display = isMajorType ? '' : 'none';
        const kw = document.getElementById('subject-keyword');
        if (kw) kw.style.display = isMajorType ? '' : 'none';
        if (isMajorType) updateDeptOptions();
      };
    }

    function fillSubjectListSelect() {
      const select = document.getElementById('subject-list-select'); if(!select) return;
      select.innerHTML = '';
      (subjects||[]).forEach(subj => {
        const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; select.appendChild(opt);
      });
    }

    categorySelect.onchange = function() {
      if (categorySelect.value === 'major') {
        majorArea.style.display = '';
        typeSelect.style.display = 'none';
        const kw = document.getElementById('subject-keyword'); if (kw) kw.style.display = '';
        const sarea = document.getElementById('subject-search-area'); if (sarea) sarea.style.display = 'none';
      } else if (categorySelect.value === 'subject') {
        majorArea.style.display = 'none';
        typeSelect.style.display = 'none';
        const kw = document.getElementById('subject-keyword'); if (kw) kw.style.display = 'none';
        const sarea = document.getElementById('subject-search-area'); if (sarea) { sarea.style.display = 'inline-flex'; fillSubjectListSelect(); }
      } else if (categorySelect.value === 'type') {
        majorArea.style.display = 'none';
        typeSelect.style.display = '';
        const kw = document.getElementById('subject-keyword'); if (kw) kw.style.display = 'none';
        const sarea = document.getElementById('subject-search-area'); if (sarea) sarea.style.display = 'none';
      }
    };
    categorySelect.dispatchEvent(new Event('change'));

    function renderTable() {
      let filtered = (subjects||[]);
      if (categorySelect.value === 'major') {
        const dept = deptSelect.value; const major = majorSelect.value;
        filtered = filtered.filter(s => (dept === '' || s.dept === dept) && (major === '' || s.major === major));
      } else if (categorySelect.value === 'subject') {
        const codeInput = (document.getElementById('subject-code-input')||{}).value.trim();
        const selectCode = (document.getElementById('subject-list-select')||{}).value;
        if (codeInput) filtered = (subjects||[]).filter(s => s.code.includes(codeInput));
        else if (selectCode) filtered = (subjects||[]).filter(s => s.code === selectCode);
      } else if (categorySelect.value === 'type') {
        const type = typeSelect.value; if (type) filtered = filtered.filter(s => s.type === type);
      }
      const tbody = document.getElementById('basket-list'); if(!tbody) return; tbody.innerHTML = '';
      filtered.forEach((s,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap !== undefined ? s.cap : 30}</td><td><button class='btn apply'>신청</button></td>`;
          tr.querySelector('.apply').onclick = function() { addToBasket(s); };
        tbody.appendChild(tr);
      });
    }

    document.getElementById('search-btn').onclick = renderTable;

    const quickBtn = document.getElementById('quick-apply-btn');
    if (quickBtn) {
      quickBtn.onclick = function() {
        const raw = (document.getElementById('quick-code') || {}).value || ''; const val = raw.trim();
        const section = (document.getElementById('quick-section') || {}).value || '';
        if (!val) { if (window.Toast && Toast.show) Toast.show('과목코드를 입력하세요'); else alert('과목코드를 입력하세요'); return; }
        if (!section) { if (window.Toast && Toast.show) Toast.show('분반을 입력하세요 (예: 001)'); else alert('분반을 입력하세요 (예: 001)'); return; }
        if (section !== '001') { if (window.Toast && Toast.show) Toast.show("분반은 '001'로 입력해야 합니다."); else alert("분반은 '001'로 입력해야 합니다."); return; }
        const code = val.split('-')[0].toUpperCase(); const subj = (subjects||[]).find(s => (s.code||'').toUpperCase() === code);
        if (!subj) { if (window.Toast && Toast.show) Toast.show('과목을 찾을 수 없습니다'); else alert('과목을 찾을 수 없습니다'); return; }
        const newSubj = Object.assign({}, subj); newSubj.section = section;
        addToBasket(newSubj);
        if (window.Toast && Toast.show) Toast.show(`${subj.name} 예비신청 완료`); else alert(`${subj.name} 예비신청 완료`);
        (document.getElementById('quick-code') || {}).value = ''; (document.getElementById('quick-section') || {}).value = '';
      };
    }

    if (document.getElementById('subject-code-input')) document.getElementById('subject-code-input').onkeyup = function(e){};
    if (document.getElementById('subject-list-select')) document.getElementById('subject-list-select').onchange = function(){};
    if (document.getElementById('subject-keyword')) document.getElementById('subject-keyword').onkeyup = function(e){};

    function getBasket() { return JSON.parse(localStorage.getItem('basketList')||'[]'); }
    function setBasket(list) { localStorage.setItem('basketList', JSON.stringify(list)); }
    function addToBasket(subject) { let list = getBasket(); if(list.find(s=>s.code===subject.code)) return; list.push(subject); setBasket(list); renderBasketTable(); }
    function removeFromBasket(code) { let list = getBasket(); list = list.filter(s=>s.code!==code); setBasket(list); renderBasketTable(); }
    function renderBasketTable() { const list = getBasket(); const tbody = document.querySelector('#my-basket tbody'); tbody.innerHTML = ''; list.forEach((s,i) => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap !== undefined ? s.cap : 30}</td><td><button class='btn del'>삭제</button></td>`; tr.querySelector('.del').onclick = function() { removeFromBasket(s.code); }; tbody.appendChild(tr); }); }
    renderBasketTable();
  }

  // 초기 학기 체크 및 초기화/비활성화
  const currentSemester = localStorage.getItem('currentSemester') || '2';
  if (currentSemester === '1') {
    disableBasketUI(true);
  } else {
    enableBasketUI();
    initBasket();
  }

  // 부모 창에서 학기 변경 시 즉시 반영
    window.addEventListener('storage', function(e) {
      if (e.key === 'currentSemester') {
        if (e.newValue === '1') {
          disableBasketUI(true);
        } else {
          enableBasketUI();
          initBasket();
        }
      }
    });
  // postMessage로 부모 창에서 직접 전달할 때도 처리 (즉시 반영)
  window.addEventListener('message', function(ev) {
    try {
      const d = ev.data || {};
      if (d && d.type === 'semester-changed') {
        if (String(d.value) === '1') {
          disableBasketUI(true);
        } else {
          enableBasketUI();
          initBasket();
        }
      }
    } catch (err) { }
  });
  };