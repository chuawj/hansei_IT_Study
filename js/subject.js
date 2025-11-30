window.onload = function() {
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
      try { fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || ''); } catch(e) {}
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
    deptSelect.onchange = function() { updateMajorOptions(); try { fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || ''); } catch(e){} };
    majorSelect.onchange = function() { try { fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || ''); } catch(e){} };
    updateDeptOptions();
    function populateTypeOptions() {
      typeSelect.innerHTML = '';
      const preferred = ['전공필수','전공선택','전공기초','교양필수','교양선택','채플','연계필수','연계선택'];
      const typesSet = new Set(subjects.map(s => s.type).filter(Boolean));
      const types = Array.from(typesSet);
      const optAll = document.createElement('option'); optAll.value = ''; optAll.textContent = '전체';
      typeSelect.appendChild(optAll);
      preferred.forEach(p => {
        if (typesSet.has(p)) {
          const opt = document.createElement('option'); opt.value = p; opt.textContent = p;
          typeSelect.appendChild(opt);
          const idx = types.indexOf(p); if (idx !== -1) types.splice(idx,1);
          typesSet.delete(p);
        }
      });
      types.sort();
      types.forEach(t => {
        const opt = document.createElement('option'); opt.value = t; opt.textContent = t;
        typeSelect.appendChild(opt);
      });
    }
    populateTypeOptions();
    const typeButtonsContainer = document.getElementById('type-buttons');
    const typeButtonEls = document.querySelectorAll('.type-button');

    if (typeButtonEls && typeButtonEls.length) {
      typeButtonEls.forEach(btn => {
        btn.addEventListener('click', function() {
          typeButtonEls.forEach(b=>b.classList.remove('active'));
          this.classList.add('active');
          const v = this.dataset.value || '';
          currentTypeValue = v;
          if (typeSelect) {
            typeSelect.value = v;
            typeSelect.dispatchEvent(new Event('change'));
          } else {
            const isMajorType = ['전공필수','전공선택','전공기초'].includes(v);
            if (majorArea) majorArea.style.display = isMajorType ? '' : 'none';
            const nameSelect = document.getElementById('subject-name-select'); if (nameSelect) nameSelect.style.display = isMajorType ? '' : 'none';
            if (isMajorType) updateDeptOptions();
          }
        });
      });
    }

    if (typeSelect) {
      typeSelect.onchange = function() {
        const val = typeSelect.value || '';
        currentTypeValue = val;
        const isMajorType = ['전공필수','전공선택','전공기초'].includes(val);
        if (majorArea) majorArea.style.display = isMajorType ? '' : 'none';
        const nameSelect = document.getElementById('subject-name-select');
        if (nameSelect) nameSelect.style.display = isMajorType ? '' : 'none';
        if (isMajorType) updateDeptOptions();
        if (typeButtonEls && typeButtonEls.length) typeButtonEls.forEach(b=>b.classList.remove('active'));
      };
    }
    function fillSubjectListSelect() {
      const select = document.getElementById('subject-list-select');
      if (!select) return;
      select.innerHTML = '';
      const nameSelect = document.getElementById('subject-name-select'); if (nameSelect) nameSelect.innerHTML = '';
      (subjects||[]).forEach(subj => {
        const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; select.appendChild(opt);
        if (nameSelect) {
          const opt2 = document.createElement('option'); opt2.value = subj.code; opt2.textContent = `${subj.name} [${subj.code}]`; nameSelect.appendChild(opt2);
        }
      });
    }

    function fillSubjectNameSelect(filterDept, filterMajor) {
      const nameSelect = document.getElementById('subject-name-select'); if (!nameSelect) return;
      nameSelect.innerHTML = '';
      const list = (subjects||[]).filter(s => {
        if (filterDept && filterDept !== '' && s.dept !== filterDept) return false;
        if (filterMajor && filterMajor !== '' && s.major !== filterMajor) return false;
        return true;
      });
      const allOpt = document.createElement('option'); allOpt.value = ''; allOpt.textContent = '전체'; nameSelect.appendChild(allOpt);
      list.forEach(subj => {
        const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; nameSelect.appendChild(opt);
      });
    }

    categorySelect.onchange = function() {
      const nameSelect = document.getElementById('subject-name-select');
      if(categorySelect.value === 'major') {
        majorArea.style.display = '';
        typeSelect.style.display = 'none';
        if (nameSelect) nameSelect.style.display = '';
        document.getElementById('subject-search-area').style.display = 'none';
        try { fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || ''); } catch(e) {}
      } else if(categorySelect.value === 'subject') {
        majorArea.style.display = 'none';
        typeSelect.style.display = 'none';
        if (nameSelect) nameSelect.style.display = 'none';
        document.getElementById('subject-search-area').style.display = 'inline-flex';
        fillSubjectListSelect();
      } else if(categorySelect.value === 'type') {
        majorArea.style.display = 'none';
        typeSelect.style.display = '';
        if (nameSelect) nameSelect.style.display = 'none';
        document.getElementById('subject-search-area').style.display = 'none';
      }
    };
    categorySelect.dispatchEvent(new Event('change'));
    let currentTypeValue = '';
    function renderTable() {
      let filtered = (subjects||[]);
      const cat = (categorySelect||{}).value || '';
      if (cat === 'major') {
        const dept = (deptSelect||{}).value || '';
        const major = (majorSelect||{}).value || '';
        filtered = filtered.filter(s => (!dept || s.dept === dept) && (!major || s.major === major));
      } else if (cat === 'subject') {
        const codeInput = ((document.getElementById('subject-code-input'))||{}).value.trim() || '';
        const selectCode = ((document.getElementById('subject-list-select'))||{}).value || '';
        if (codeInput) filtered = (subjects||[]).filter(s => s.code.includes(codeInput));
        else if (selectCode) filtered = (subjects||[]).filter(s => s.code === selectCode);
        else filtered = subjects || [];
      } else if (cat === 'type') {
        const typeVal = currentTypeValue || (typeSelect ? typeSelect.value : '');
        if (typeVal) filtered = filtered.filter(s => s.type === typeVal);
        if (['전공필수','전공선택','전공기초'].includes(typeVal)) {
          const dept = (deptSelect||{}).value || '';
          const major = (majorSelect||{}).value || '';
          if (dept) filtered = filtered.filter(s => s.dept === dept);
          if (major) filtered = filtered.filter(s => s.major === major);
        }
      }
      const tbody = document.getElementById('subject-list'); if(!tbody) return;
      tbody.innerHTML = '';
      filtered.forEach((s,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap||''}</td>`;
        tbody.appendChild(tr);
      });
    }
    function getBasket() {
      return JSON.parse(localStorage.getItem('basketList')||'[]');
    }
    function setBasket(list) {
      localStorage.setItem('basketList', JSON.stringify(list));
    }
    function addToBasket(subject) {
      let list = getBasket();
      if(list.find(s=>s.code===subject.code)) return;
      list.push(subject);
      setBasket(list);
    }
  document.getElementById('search-btn').onclick = renderTable;
  if (document.getElementById('subject-code-input')) document.getElementById('subject-code-input').onkeyup = function(e){ /* no-op */ };
  if (document.getElementById('subject-list-select')) document.getElementById('subject-list-select').onchange = function(){ /* no-op */ };
  if (document.getElementById('subject-name-select')) document.getElementById('subject-name-select').onchange = function(e){ /* no-op */ };

}
