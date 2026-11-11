/* =========================================================
   PeakSales V2 - apply-form.js
   Job application form handler for careers.html
   ========================================================= */

'use strict';

(function () {
  const form = document.getElementById('apply-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const charCounter = document.getElementById('char-counter');
  const whySalesField = document.getElementById('why_sales');
  let applyEndpoint = '';
  let startedTracked = false;

  /* ── Load config ─────────────────────────────────────────── */
  fetch('data/config.json')
    .then(r => r.json())
    .then(config => {
      applyEndpoint = config.applyEndpoint || '';
    })
    .catch(() => {
      applyEndpoint = '';
    });

  /* ── Load roles into select ──────────────────────────────── */
  const roleSelect = document.getElementById('role');
  if (roleSelect) {
    fetch('data/roles.json')
      .then(r => r.json())
      .then(roles => {
        if (roles && roles.length) {
          roles.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role.title || role;
            opt.textContent = role.title || role;
            roleSelect.appendChild(opt);
          });
        }
      })
      .catch(() => {});
  }

  /* ── Track first interaction ─────────────────────────────── */
  form.addEventListener('focusin', () => {
    if (startedTracked) return;
    startedTracked = true;
    console.debug('[PeakSales analytics]', 'apply_started');
  }, { once: false });

  /* ── Character counter for why_sales ─────────────────────── */
  if (whySalesField && charCounter) {
    const maxLen = parseInt(whySalesField.getAttribute('maxlength') || '280', 10);
    whySalesField.addEventListener('input', () => {
      const remaining = maxLen - whySalesField.value.length;
      charCounter.textContent = remaining + ' characters remaining';
    });
  }

  /* ── Phone validation (10-digit Indian mobile) ───────────── */
  function isValidPhone(phone) {
    const cleaned = phone.replace(/[\s\-\+]/g, '');
    // Accept with or without 91 prefix
    const pattern = /^(91)?[6-9]\d{9}$/;
    return pattern.test(cleaned);
  }

  /* ── Show field error ────────────────────────────────────── */
  function showError(field, message) {
    clearError(field);
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;
    field.classList.add('invalid');
    field.parentElement.appendChild(errorEl);
  }

  function clearError(field) {
    field.classList.remove('invalid');
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
  }

  function clearAllErrors() {
    form.querySelectorAll('.field-error').forEach(e => e.remove());
    form.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
  }

  /* ── Validate form ───────────────────────────────────────── */
  function validateForm() {
    clearAllErrors();
    let firstInvalid = null;

    // Full name
    const name = form.querySelector('#full_name');
    if (name && !name.value.trim()) {
      showError(name, 'Please enter your full name');
      if (!firstInvalid) firstInvalid = name;
    }

    // Phone
    const phone = form.querySelector('#phone');
    if (phone) {
      if (!phone.value.trim()) {
        showError(phone, 'Please enter your WhatsApp number');
        if (!firstInvalid) firstInvalid = phone;
      } else if (!isValidPhone(phone.value)) {
        showError(phone, 'Please enter a valid 10-digit Indian mobile number');
        if (!firstInvalid) firstInvalid = phone;
      }
    }

    // Email
    const email = form.querySelector('#email');
    if (email && !email.value.trim()) {
      showError(email, 'Please enter your email');
      if (!firstInvalid) firstInvalid = email;
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, 'Please enter a valid email address');
      if (!firstInvalid) firstInvalid = email;
    }

    // City
    const city = form.querySelector('#city');
    if (city && !city.value.trim()) {
      showError(city, 'Please enter your city');
      if (!firstInvalid) firstInvalid = city;
    }

    // Role
    if (roleSelect && !roleSelect.value) {
      showError(roleSelect, 'Please select a role');
      if (!firstInvalid) firstInvalid = roleSelect;
    }

    // Experience (radio)
    const experience = form.querySelector('input[name="experience"]:checked');
    if (!experience) {
      const expGroup = form.querySelector('.experience-group');
      if (expGroup) {
        const label = expGroup.querySelector('legend') || expGroup;
        showError(label, 'Please select your experience level');
        if (!firstInvalid) firstInvalid = expGroup;
      }
    }

    // Languages (checkbox - at least one)
    const languages = form.querySelectorAll('input[name="languages"]:checked');
    if (!languages.length) {
      const langGroup = form.querySelector('.languages-group');
      if (langGroup) {
        const label = langGroup.querySelector('legend') || langGroup;
        showError(label, 'Please select at least one language');
        if (!firstInvalid) firstInvalid = langGroup;
      }
    }

    // Work mode (radio)
    const workMode = form.querySelector('input[name="work_mode"]:checked');
    if (!workMode) {
      const wmGroup = form.querySelector('.work-mode-group');
      if (wmGroup) {
        const label = wmGroup.querySelector('legend') || wmGroup;
        showError(label, 'Please select your work mode preference');
        if (!firstInvalid) firstInvalid = wmGroup;
      }
    }

    // Consent
    const consent = form.querySelector('#consent');
    if (consent && !consent.checked) {
      showError(consent, 'You must agree to proceed');
      if (!firstInvalid) firstInvalid = consent;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }

    return true;
  }

  /* ── Honeypot check ──────────────────────────────────────── */
  function isBot() {
    const honeypot = form.querySelector('#company_website');
    return honeypot && honeypot.value.length > 0;
  }

  /* ── Submit handler ──────────────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isBot()) {
      // Fake success for bots
      showSuccess();
      return;
    }

    if (!validateForm()) return;

    if (!applyEndpoint) {
      showConfigUnavailable();
      return;
    }

    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const formData = new FormData(form);
      // Collect languages as comma-separated
      const langs = Array.from(form.querySelectorAll('input[name="languages"]:checked')).map(c => c.value);
      formData.set('languages', langs.join(', '));

      const response = await fetch(applyEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showSuccess();
        console.debug('[PeakSales analytics]', 'apply_submitted', { role: formData.get('role') });
      } else {
        throw new Error('Server returned ' + response.status);
      }
    } catch (err) {
      console.error('Application submit error:', err);
      showSubmitError();
    }
  });

  /* ── Success state ───────────────────────────────────────── */
  function showSuccess() {
    form.innerHTML = `
      <div class="apply-success" role="status">
        <i class="ph ph-check-circle" aria-hidden="true" style="font-size:3rem;color:var(--good);"></i>
        <h3>Application received</h3>
        <p>Thank you for applying. If your profile matches, we will reach out within a few days.</p>
      </div>
    `;
  }

  /* ── Error state ─────────────────────────────────────────── */
  function showSubmitError() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
    const errorBanner = document.createElement('div');
    errorBanner.className = 'form-error-banner';
    errorBanner.setAttribute('role', 'alert');
    errorBanner.innerHTML = '<p>Something went wrong. Please try again or reach out directly.</p>';
    // Remove previous error banners
    form.querySelectorAll('.form-error-banner').forEach(e => e.remove());
    form.prepend(errorBanner);
  }

  /* ── Config unavailable ──────────────────────────────────── */
  function showConfigUnavailable() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
    const banner = document.createElement('div');
    banner.className = 'form-error-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = '<p>Applications are not being accepted online at the moment. Please check back soon.</p>';
    form.querySelectorAll('.form-error-banner').forEach(e => e.remove());
    form.prepend(banner);
  }

  /* ── Warn on page leave with unsaved data ────────────────── */
  let formDirty = false;
  form.addEventListener('input', () => { formDirty = true; });
  window.addEventListener('beforeunload', (e) => {
    if (formDirty && !form.querySelector('.apply-success')) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
