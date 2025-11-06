window.onload = function() {
// 카테고리/학부/학과 옵션 생성
      const categorySelect = document.getElementById('category-select');
      const deptSelect = document.getElementById('dept-select');
      const majorSelect = document.getElementById('major-select');
      const typeSelect = document.getElementById('type-select');
      const majorArea = document.getElementById('major-area');
      // 학부/학과 옵션
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
      // 이수구분 선택 시 전공 관련이면 학부/학과 영역과 과목명 검색 보이기
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
        if(categorySelect.value === 'major') {
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
      // 필터링 및 테이블 렌더
      function renderTable() {
        let filtered = subjects;
        if(categorySelect.value === 'major') {
          const dept = deptSelect.value;
          const major = majorSelect.value;
          filtered = filtered.filter(s =>
            (dept === '' || s.dept === dept) &&
            (major === '' || s.major === major)
          );
        } else if(categorySelect.value === 'subject') {
          const codeInput = document.getElementById('subject-code-input').value.trim();
          const selectCode = document.getElementById('subject-list-select').value;
          if(codeInput) {
            filtered = subjects.filter(s => s.code.includes(codeInput));
          } else if(selectCode) {
            filtered = subjects.filter(s => s.code === selectCode);
          }
        } else if(categorySelect.value === 'type') {
          const type = typeSelect.value;
          if(type) filtered = filtered.filter(s => s.type === type);
        }
        const tbody = document.getElementById('basket-list');
        tbody.innerHTML = '';
        filtered.forEach((s,i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${i+1}</td><td>${s.dept}</td><td>${s.major}</td><td>${s.year}</td><td>${s.name}</td><td>${s.code}</td><td>${s.type}</td><td>${s.credit}</td><td>${s.cap !== undefined ? s.cap : 30}</td><td><button class='btn apply'>신청</button></td>`;
          tr.querySelector('.apply').onclick = function() {
            addToBasket(s);
          };
          tbody.appendChild(tr);
        });
      }
  document.getElementById('search-btn').onclick = renderTable;
  // 입력 변경 시 즉시 조회되지 않도록 Enter/onchange 자동 실행을 비활성화.
  if (document.getElementById('subject-code-input')) document.getElementById('subject-code-input').onkeyup = function(e){ /* no-op */ };
  if (document.getElementById('subject-list-select')) document.getElementById('subject-list-select').onchange = function(){ /* no-op */ };
  if (document.getElementById('subject-keyword')) document.getElementById('subject-keyword').onkeyup = function(e){ /* no-op */ };
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
        renderBasketTable();
      }
      function removeFromBasket(code) {
        let list = getBasket();
        list = list.filter(s=>s.code!==code);
        setBasket(list);
        renderBasketTable();
      }
      function renderBasketTable() {
        const list = getBasket();
        const tbody = document.querySelector('#my-basket tbody');
        tbody.innerHTML = '';
        list.forEach((s,i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap !== undefined ? s.cap : 30}</td><td><button class='btn del'>삭제</button></td>`;
          tr.querySelector('.del').onclick = function() { removeFromBasket(s.code); };
          tbody.appendChild(tr);
        });
  }
  renderBasketTable();
}