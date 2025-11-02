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
        const types = Array.from(new Set(subjects.map(s => s.type).filter(Boolean))).sort();
        const optAll = document.createElement('option'); optAll.value = ''; optAll.textContent = '전체';
        typeSelect.appendChild(optAll);
        types.forEach(t => {
          const opt = document.createElement('option'); opt.value = t; opt.textContent = t;
          typeSelect.appendChild(opt);
        });
      }
      populateTypeOptions();
      
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
      // Do not auto-run renderTable on Enter or select change; require explicit search button click.
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