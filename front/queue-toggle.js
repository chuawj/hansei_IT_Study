// 대기열 스위치 토글 기능
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
