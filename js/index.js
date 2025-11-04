window.onload = function() {
    // 대기열 기능 토글
    let queueEnabled = true;
    if(localStorage.getItem('queueEnabled')!==null) {
      queueEnabled = localStorage.getItem('queueEnabled')==='true';
    }
    const queueToggle = document.getElementById('queue-toggle');
    const queueStatus = document.getElementById('queue-status');
    if(queueToggle) {
      queueToggle.checked = queueEnabled;
      queueStatus.textContent = queueEnabled ? 'ON' : 'OFF';
      queueToggle.onchange = function() {
        queueEnabled = queueToggle.checked;
        localStorage.setItem('queueEnabled', queueEnabled);
        queueStatus.textContent = queueEnabled ? 'ON' : 'OFF';
      };
    }
    const tabMap = {
      notice: 'front/notice.html',
      subject: 'front/subject.html',
      basket: 'front/basket.html',
      register: 'front/register.html',
      history: 'front/history.html'
    };
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = function() {
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.page === 'register') {
          localStorage.setItem('registerQueueRequired', 'true');
          mainFrame.src = tabMap[btn.dataset.page] + '?t=' + Date.now(); // 강제 새로고침
        } else {
          mainFrame.src = tabMap[btn.dataset.page];
        }
  mainFrame.style.height = '700px';
      }
    });

    let timerInterval = null;
    let openTime = null;
    const timerStatus = document.getElementById('timer-status');
    const mainFrame = document.getElementById('main-frame');
    const registerBtn = document.querySelector('.tab-btn[data-page="register"]');

    document.getElementById('set-timer-btn').onclick = function() {
      const hour = parseInt(document.getElementById('timer-hour').value, 10) || 0;
      const min = parseInt(document.getElementById('timer-min').value, 10) || 0;
      const sec = parseInt(document.getElementById('timer-sec').value, 10) || 0;

      const now = new Date();
      let openHour = now.getHours() + hour;
      let openMin = now.getMinutes() + min;
      let openSec = now.getSeconds() + sec;

      if (openSec >= 60) {
        openMin += Math.floor(openSec / 60);
        openSec = openSec % 60;
      }
      if (openMin >= 60) {
        openHour += Math.floor(openMin / 60);
        openMin = openMin % 60;
      }
      if (openHour >= 24) {
        openHour = openHour % 24;
      }

      openTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), openHour, openMin, openSec);
      if (openTime <= now) {
        openTime.setDate(openTime.getDate() + 1);
      }

      timerStatus.textContent = "남은 시간: 계산중...";
      registerBtn.disabled = true;
      registerBtn.style.opacity = 0.5;

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        const now = new Date();
        let diff = Math.floor((openTime - now) / 1000);
        if (diff <= 0) {
          clearInterval(timerInterval);
          timerStatus.textContent = "수강신청이 열렸습니다!";
          registerBtn.disabled = false;
          registerBtn.style.opacity = 1;
        } else {
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          const s = diff % 60;
          timerStatus.textContent = `남은 시간: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
      }, 500);
    };
    registerBtn.disabled = true;
    registerBtn.style.opacity = 0.5;
  document.getElementById('reset-btn').onclick = function() {
      localStorage.removeItem('registerList');
      localStorage.removeItem('basketList');
      registerBtn.disabled = true;
      registerBtn.style.opacity = 0.5;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('.tab-btn[data-page="notice"]').classList.add('active');
  mainFrame.src = tabMap['notice'];
  mainFrame.style.height = '520px';
      timerStatus.textContent = '초기화 완료!';
      setTimeout(()=>{ timerStatus.textContent = ''; }, 1500);
    };
}