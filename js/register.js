
document.addEventListener('DOMContentLoaded', function() {
  function getBasket() {
    return JSON.parse(localStorage.getItem('basketList')||'[]');
  }
  const categorySelect = document.getElementById('category-select');
  const deptSelect = document.getElementById('dept-select');
  const majorSelect = document.getElementById('major-select');
  const typeSelect = document.getElementById('type-select');
  const majorArea = document.getElementById('major-area');
  function updateDeptOptions() {
    deptSelect.innerHTML = '';
    categoryData.forEach(cat => {
      cat.depts.forEach(d => {
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
    categoryData.forEach(cat => {
      cat.depts.forEach(d => {
        if(d.name === deptSelect.value) {
          d.majors.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m; opt.textContent = m;
            majorSelect.appendChild(opt);
          });
          found = true;
        }
      });
    });
    if(!found) {
      const opt = document.createElement('option');
      opt.value = ''; opt.textContent = '전체';
      majorSelect.appendChild(opt);
    }
  }
  deptSelect.onchange = updateMajorOptions;
  updateDeptOptions();
  function fillSubjectListSelect() {
    const select = document.getElementById('subject-list-select');
    select.innerHTML = '';
    subjects.forEach(subj => {
      const opt = document.createElement('option');
      opt.value = subj.code;
      opt.textContent = `${subj.name} [${subj.code}]`;
      select.appendChild(opt);
    });
  }

  categorySelect.onchange = function() {
    if(categorySelect.value === 'basket') {
      majorArea.style.display = 'none';
      typeSelect.style.display = 'none';
      document.getElementById('subject-keyword').style.display = 'none';
      document.getElementById('subject-search-area').style.display = 'none';
    } else if(categorySelect.value === 'major') {
      majorArea.style.display = '';
      typeSelect.style.display = 'none';
      document.getElementById('subject-keyword').style.display = '';
      document.getElementById('subject-search-area').style.display = 'none';
    } else if(categorySelect.value === 'subject') {
      majorArea.style.display = 'none';
      typeSelect.style.display = 'none';
      document.getElementById('subject-keyword').style.display = 'none';
      document.getElementById('subject-search-area').style.display = 'inline-flex';
      fillSubjectListSelect();
    } else if(categorySelect.value === 'type') {
      majorArea.style.display = 'none';
      typeSelect.style.display = '';
      document.getElementById('subject-keyword').style.display = 'none';
      document.getElementById('subject-search-area').style.display = 'none';
    }
  };
  categorySelect.dispatchEvent(new Event('change'));
  function renderTable() {
    let filtered = [];
    if(categorySelect.value === 'basket') {
      filtered = getBasket();
    } else if(categorySelect.value === 'major') {
      const dept = deptSelect.value;
      const major = majorSelect.value;
      filtered = subjects.filter(s =>
        s.dept === dept &&
        s.major === major
      );
    } else if(categorySelect.value === 'subject') {
      const codeInput = document.getElementById('subject-code-input').value.trim();
      const selectCode = document.getElementById('subject-list-select').value;
      if(codeInput) {
        filtered = subjects.filter(s => s.code.includes(codeInput));
      } else if(selectCode) {
        filtered = subjects.filter(s => s.code === selectCode);
      } else {
        filtered = subjects;
      }
    } else if(categorySelect.value === 'type') {
      const type = typeSelect.value;
      filtered = subjects;
      if(type) filtered = filtered.filter(s => s.type === type);
    }
    const tbody = document.getElementById('reg-list');
    tbody.innerHTML = '';
    filtered.forEach((s,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${s.dept}</td><td>${s.major}</td><td>${s.year}</td><td>${s.name}</td><td>${s.code}</td><td>${s.type}</td><td>${s.credit}</td><td>${s.cap||''}</td><td><button class='btn apply'>신청</button></td>`;
        tr.querySelector('.apply').onclick = function() {
          QueueModal.showApply(()=>addToRegister(s));
        };
      tbody.appendChild(tr);
    });
  }
  document.getElementById('search-btn').onclick = renderTable;
  if(document.getElementById('subject-code-input')) {
    document.getElementById('subject-code-input').onkeyup = function(e) {
      if(e.key === 'Enter') renderTable();
    };
  }
  if(document.getElementById('subject-list-select')) {
    document.getElementById('subject-list-select').onchange = renderTable;
  }
  function getRegister() {
    return JSON.parse(localStorage.getItem('registerList')||'[]');
  }
  function setRegister(list) {
    localStorage.setItem('registerList', JSON.stringify(list));
  }
  function addToRegister(subject) {
    let list = getRegister();
    if(list.find(s=>s.code===subject.code)) {
      showToast('이미 신청된 과목입니다.');
      return;
    }
    list.push(subject);
    setRegister(list);
    let basket = JSON.parse(localStorage.getItem('basketList')||'[]');
    basket = basket.filter(s=>s.code!==subject.code);
    localStorage.setItem('basketList', JSON.stringify(basket));
    renderTable();
    renderRegisterTable();
    showToast('신청이 완료되었습니다.');
  }
  function removeFromRegister(code) {
    let list = getRegister();
    list = list.filter(s=>s.code!==code);
    setRegister(list);
    renderRegisterTable();
  }
  function renderRegisterTable() {
    const list = getRegister();
    const tbody = document.querySelector('#my-reg tbody');
    tbody.innerHTML = '';
    list.forEach((s,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap!==undefined?s.cap:30}</td><td><button class='btn del'>삭제</button></td>`;
      tr.querySelector('.del').onclick = function() { removeFromRegister(s.code); };
      tbody.appendChild(tr);
    });
  }

  const quickApplyBtn = document.getElementById('quick-apply-btn');
  if (quickApplyBtn) {
    quickApplyBtn.onclick = function() {
      const val = document.getElementById('quick-code').value.trim();
      if(!val) return Toast.show('과목코드-분반을 입력하세요.');
      const m = val.match(/^([0-9]{4,6})(?:-(\d{1,2}))?$/);
      if(!m) return Toast.show('형식: 과목코드-분반 (예:15905 또는 15905-1)');
      const code = m[1];
      const section = m[2] || '';
      const subj = subjects.find(s => s.code === code);
      if(!subj) return Toast.show('해당 과목코드의 과목이 없습니다.');
      let list = getRegister();
      if(list.find(s=>s.code===subj.code && (!section || s.section===section))) {
        Toast.show('이미 신청된 과목입니다.');
        return;
      }
      QueueModal.showApply(()=>{
        if(section) subj.section = section;
        list.push(subj);
        setRegister(list);
        renderTable();
        renderRegisterTable();
        Toast.show('신청되었습니다.');
      });
    }
  }

  QueueModal.showEnter(function() {
    renderTable();
    renderRegisterTable();
  });
});
    function getBasket() {
      return JSON.parse(localStorage.getItem('basketList')||'[]');
    }
    const categorySelect = document.getElementById('category-select');
    const deptSelect = document.getElementById('dept-select');
    const majorSelect = document.getElementById('major-select');
    const typeSelect = document.getElementById('type-select');
    const majorArea = document.getElementById('major-area');
    function updateDeptOptions() {
      deptSelect.innerHTML = '';
      categoryData.forEach(cat => {
        cat.depts.forEach(d => {
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
      categoryData.forEach(cat => {
        cat.depts.forEach(d => {
          if(d.name === deptSelect.value) {
            d.majors.forEach(m => {
              const opt = document.createElement('option');
              opt.value = m; opt.textContent = m;
              majorSelect.appendChild(opt);
            });
            found = true;
          }
        });
      });
      if(!found) {
        const opt = document.createElement('option');
        opt.value = ''; opt.textContent = '전체';
        majorSelect.appendChild(opt);
      }
    }
    deptSelect.onchange = updateMajorOptions;
    updateDeptOptions();
    function fillSubjectListSelect() {
      const select = document.getElementById('subject-list-select');
      select.innerHTML = '';
      subjects.forEach(subj => {
        const opt = document.createElement('option');
        opt.value = subj.code;
        opt.textContent = `${subj.name} [${subj.code}]`;
        select.appendChild(opt);
      });
    }

    categorySelect.onchange = function() {
      if(categorySelect.value === 'basket') {
        majorArea.style.display = 'none';
        typeSelect.style.display = 'none';
        document.getElementById('subject-keyword').style.display = 'none';
        document.getElementById('subject-search-area').style.display = 'none';
      } else if(categorySelect.value === 'major') {
        majorArea.style.display = '';
        typeSelect.style.display = 'none';
        document.getElementById('subject-keyword').style.display = '';
        document.getElementById('subject-search-area').style.display = 'none';
      } else if(categorySelect.value === 'subject') {
        majorArea.style.display = 'none';
        typeSelect.style.display = 'none';
        document.getElementById('subject-keyword').style.display = 'none';
        document.getElementById('subject-search-area').style.display = 'inline-flex';
        fillSubjectListSelect();
      } else if(categorySelect.value === 'type') {
        majorArea.style.display = 'none';
        typeSelect.style.display = '';
        document.getElementById('subject-keyword').style.display = 'none';
        document.getElementById('subject-search-area').style.display = 'none';
      }
    };
    categorySelect.dispatchEvent(new Event('change'));
    function renderTable() {
      let filtered = [];
      if(categorySelect.value === 'basket') {
        filtered = getBasket();
      } else if(categorySelect.value === 'major') {
        const dept = deptSelect.value;
        const major = majorSelect.value;
        filtered = subjects.filter(s =>
          s.dept === dept &&
          s.major === major
        );
      } else if(categorySelect.value === 'subject') {
        const codeInput = document.getElementById('subject-code-input').value.trim();
        const selectCode = document.getElementById('subject-list-select').value;
        if(codeInput) {
          filtered = subjects.filter(s => s.code.includes(codeInput));
        } else if(selectCode) {
          filtered = subjects.filter(s => s.code === selectCode);
        } else {
          filtered = subjects;
        }
      } else if(categorySelect.value === 'type') {
        const type = typeSelect.value;
        filtered = subjects;
        if(type) filtered = filtered.filter(s => s.type === type);
      }
      const tbody = document.getElementById('reg-list');
      tbody.innerHTML = '';
      filtered.forEach((s,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${s.dept}</td><td>${s.major}</td><td>${s.year}</td><td>${s.name}</td><td>${s.code}</td><td>${s.type}</td><td>${s.credit}</td><td>${s.cap||''}</td><td><button class='btn apply'>신청</button></td>`;
          tr.querySelector('.apply').onclick = function() {
            QueueModal.showApply(()=>addToRegister(s));
          };
        tbody.appendChild(tr);
      });
    }
    document.getElementById('search-btn').onclick = renderTable;
    if(document.getElementById('subject-code-input')) {
      document.getElementById('subject-code-input').onkeyup = function(e) {
        if(e.key === 'Enter') renderTable();
      };
    }
    if(document.getElementById('subject-list-select')) {
      document.getElementById('subject-list-select').onchange = renderTable;
    }
    function getRegister() {
      return JSON.parse(localStorage.getItem('registerList')||'[]');
    }
    function setRegister(list) {
      localStorage.setItem('registerList', JSON.stringify(list));
    }
    function addToRegister(subject) {
      let list = getRegister();
      const isDuplicate = list.some(s => {
        if (subject.section !== undefined && subject.section !== "") {
          return s.code === subject.code && s.section === subject.section;
        } else {
          return s.code === subject.code && (!s.section || s.section === "");
        }
      });
      if(isDuplicate) {
        Toast.show('이미 신청된 과목입니다.');
        return;
      }
      list.push(subject);
      setRegister(list);
      let basket = JSON.parse(localStorage.getItem('basketList')||'[]');
      basket = basket.filter(s=>s.code!==subject.code);
      localStorage.setItem('basketList', JSON.stringify(basket));
      renderTable();
      renderRegisterTable();
      Toast.show('신청되었습니다.');
    }
    function removeFromRegister(code) {
      let list = getRegister();
      list = list.filter(s=>s.code!==code);
      setRegister(list);
      renderRegisterTable();
    }
    function renderRegisterTable() {
      const list = getRegister();
      const tbody = document.querySelector('#my-reg tbody');
      tbody.innerHTML = '';
      list.forEach((s,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap!==undefined?s.cap:30}</td><td><button class='btn del'>삭제</button></td>`;
        tr.querySelector('.del').onclick = function() { removeFromRegister(s.code); };
        tbody.appendChild(tr);
      });
    }
    renderTable();
    renderRegisterTable();