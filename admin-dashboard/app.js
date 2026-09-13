// Admin Dashboard Interaction Logic

function switchTab(tabId) {
  // Update nav links
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active');
  });

  const activeLink = document.querySelector(`.nav-item[href="#${tabId}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Switch tab content
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  const targetTab = document.getElementById(`${tabId}-tab`);
  if (targetTab) {
    targetTab.classList.add('active');
  } else {
    // Default fallback to overview
    document.getElementById('overview-tab').classList.add('active');
  }

  // Re-create icons if new elements rendered
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Auto-simulate radar live pings
setInterval(() => {
  const radar = document.querySelector('.radar-ping');
  if (radar) {
    radar.style.transform = `scale(${1 + Math.random() * 0.2})`;
  }
}, 2000);

console.log('⚡ Ullur Mechanic Admin Super Panel Initialized');
