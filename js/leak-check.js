/* =========================================================
   PeakSales V2 - leak-check.js
   60-second Revenue Leak Check interactive form
   ========================================================= */

'use strict';

(function () {
  const form = document.getElementById('leak-check-form');
  if (!form) return;

  const counter = document.getElementById('leak-counter');
  const counterLabel = document.getElementById('leak-counter-label');
  const resultText = document.getElementById('leak-result-text');
  const ctaBtn = document.getElementById('leak-cta-btn');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');

  function updateCount() {
    const count = form.querySelectorAll('input[type="checkbox"]:checked').length;

    if (counter) counter.textContent = count;
    if (counterLabel) counterLabel.textContent = count === 1 ? 'leak found' : 'leaks found';

    // Update result text based on count
    if (resultText) {
      if (count === 0) {
        resultText.textContent = '';
      } else if (count <= 1) {
        resultText.textContent = 'Your process is tight. A call can still find the small leaks.';
      } else if (count <= 3) {
        resultText.textContent = 'You are losing leads at more than one stage.';
      } else {
        resultText.textContent = 'Most of your leads go cold before anyone tries to close them.';
      }
    }

    // Toggle result visibility
    const resultWrap = document.getElementById('leak-result');
    if (resultWrap) {
      resultWrap.hidden = count === 0;
    }
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', updateCount);
  });

  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      const count = form.querySelectorAll('input[type="checkbox"]:checked').length;
      if (typeof trackEvent === 'function') {
        trackEvent('leak_check_complete', { leak_count: count });
      } else {
        console.debug('[PeakSales analytics]', 'leak_check_complete', { leak_count: count });
      }
    });
  }

  // Initialize
  updateCount();
})();
