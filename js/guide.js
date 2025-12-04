// guide.js - 간단한 투어(가이드 툴팁)
(function(){
  'use strict';

  function $(sel, root=document) { return root.querySelector(sel); }

  function createEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  // Tour
  function Tour(steps) {
    this.steps = steps || [];
    this.index = -1;
    this.overlay = null;
    this.tooltip = null;
    this.ring = null;
  }

  Tour.prototype.start = function() {
    if (!this.steps || !this.steps.length) return;
    this.build();
    this.next();
  };

  Tour.prototype.build = function() {
    if (this.overlay) return;
    this.overlay = createEl('div','guide-overlay');
    document.body.appendChild(this.overlay);

    this.ring = createEl('div','guide-highlight-ring');
    document.body.appendChild(this.ring);

    this.tooltip = createEl('div','guide-tooltip');
    this.tooltip.innerHTML = '<div class="title"></div><div class="desc"></div><div class="actions"></div>';
    document.body.appendChild(this.tooltip);

    // click outside to close
    this.overlay.addEventListener('click', ()=> this.end());
  };

  Tour.prototype.showStep = function(i) {
    if (i < 0 || i >= this.steps.length) return this.end();
    this.index = i;
    const s = this.steps[i];
    // run onShow hook
    try { if (s.onShow) s.onShow(); } catch(e) { console.warn(e); }

    const titleEl = this.tooltip.querySelector('.title');
    const descEl = this.tooltip.querySelector('.desc');
    const actionsEl = this.tooltip.querySelector('.actions');
    titleEl.textContent = s.title || '';
    descEl.textContent = s.text || '';
    actionsEl.innerHTML = '';

    const btnClose = createEl('button','btn secondary'); btnClose.textContent = '닫기';
    btnClose.classList.add('secondary'); btnClose.onclick = ()=> this.end();
    const btnPrev = createEl('button','btn secondary'); btnPrev.textContent = '이전'; btnPrev.onclick = ()=> this.prev();
    const btnNext = createEl('button','btn'); btnNext.textContent = (i === this.steps.length-1) ? '완료' : '다음';
    btnNext.onclick = ()=> { try{ if (s.onNext) s.onNext(); } catch(e){}; this.next(); };

    if (i>0) actionsEl.appendChild(btnPrev);
    actionsEl.appendChild(btnClose);
    actionsEl.appendChild(btnNext);

    // position tooltip near target if exists
    const target = s.selector ? document.querySelector(s.selector) : null;
    if (target) {
      const rect = target.getBoundingClientRect();
      // show ring
      this.ring.style.display = '';
      this.ring.style.left = (rect.left - 8 + window.scrollX) + 'px';
      this.ring.style.top = (rect.top - 8 + window.scrollY) + 'px';
      this.ring.style.width = (rect.width + 16) + 'px';
      this.ring.style.height = (rect.height + 16) + 'px';

      // place tooltip intelligently
      const ttWidth = 340;
      let left = rect.right + 12 + window.scrollX;
      let top = rect.top + window.scrollY;
      if (left + ttWidth > window.innerWidth) left = Math.max(12, rect.left - ttWidth - 12 + window.scrollX);
      if (top + 120 > window.innerHeight) top = Math.max(12, window.innerHeight - 140 + window.scrollY);
      this.tooltip.style.left = left + 'px';
      this.tooltip.style.top = top + 'px';
    } else {
      // center on screen and hide ring
      this.ring.style.display = 'none';
      this.tooltip.style.left = Math.max(12, (window.innerWidth - 360)/2) + 'px';
      this.tooltip.style.top = Math.max(80, (window.innerHeight - 160)/2) + 'px';
    }
  };

  Tour.prototype.next = function() { this.showStep(this.index + 1); };
  Tour.prototype.prev = function() { this.showStep(this.index - 1); };

  Tour.prototype.end = function() {
    if (this.overlay) this.overlay.remove();
    if (this.tooltip) this.tooltip.remove();
    if (this.ring) this.ring.remove();
    this.overlay = null; this.tooltip = null; this.ring = null; this.index = -1;
  };

  // steps configuration for main index
  const steps = [
    { selector: '#timer-setup', title: '오픈 타이머', text: '여기서 수강신청 시각을 설정합니다. 시간을 입력하고 "설정"을 누르면 타이머가 동작합니다.',
      onNext: function(){ /* nothing */ } },
    { selector: '#set-timer-btn', title: '타이머 설정', text: '설정 버튼을 누르면 입력한 시간만큼 카운트다운이 시작됩니다. 수강신청 탭은 타이머가 열리기 전까지 접근이 제한됩니다.' },
    { selector: '.tab-btn[data-page="subject"]', title: '교과목조회 탭', text: '교과목을 학부/이수구분 등으로 조회할 수 있습니다. 이 탭을 눌러 실제 교과목 조회 페이지로 이동해 보세요.',
      onNext: function(){ const el = document.querySelector('.tab-btn[data-page="subject"]'); if(el) el.click(); } },
    { selector: '.tab-btn[data-page="basket"]', title: '예비수강신청 탭', text: '예비로 신청해 둘 수 있는 탭입니다. 목록에서 과목을 찾아 예비 신청을 해보세요.',
      onNext: function(){ const el = document.querySelector('.tab-btn[data-page="basket"]'); if(el) el.click(); } },
    { selector: '.tab-btn[data-page="register"]', title: '수강신청 탭', text: '실제로 수강을 신청하는 탭입니다. 등록 시 타이머가 열려 있어야 접근할 수 있습니다.',
      onShow: function(){ /* ensure user sees info; do not auto-enter if disabled */ } },
    { selector: '#main-frame', title: '내부 페이지 사용법', text: '각 탭을 열면 오른쪽 영역에 해당 페이지가 표시됩니다. 교과목조회에서는 이수구분, 학부/학과, 과목명을 이용해 필터링할 수 있습니다.' }
  ];

  const tour = new Tour(steps);

  // attach button
  window.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('start-tour-btn');
    if (!btn) return;
    btn.addEventListener('click', function(){
      try { tour.start(); } catch(e){ console.error(e); }
    });
  });

})();
