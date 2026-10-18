/* ══════════════════════════════════════════════════
   PLINTH — Contact Form Logic (Prompt 05)
   Accessible inline validation, duplicate submission
   protection, honest submission endpoint handling.
══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────
     ENDPOINT CONFIGURATION
     Set this to your live form submission endpoint
     (e.g., https://formspree.io/f/YOUR_ID, or a custom API).
     When null, the form validates inputs and displays a
     clear configuration notice without claiming delivery.
  ───────────────────────────────────────────────── */
  const FORM_ENDPOINT = null;

  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput     = document.getElementById('enquiry-name');
  const emailInput    = document.getElementById('enquiry-email');
  const typeSelect    = document.getElementById('enquiry-type');
  const locationInput = document.getElementById('enquiry-location');
  const messageInput  = document.getElementById('enquiry-message');
  const submitBtn     = document.getElementById('enquiry-submit');

  const noticeConfig  = document.getElementById('form-notice-config');
  const noticeSuccess = document.getElementById('form-notice-success');
  const noticeError   = document.getElementById('form-notice-error');

  let isSubmitting = false;

  // Email regex validation
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function hideAllNotices() {
    if (noticeConfig)  noticeConfig.classList.remove('is-visible');
    if (noticeSuccess) noticeSuccess.classList.remove('is-visible');
    if (noticeError)   noticeError.classList.remove('is-visible');
  }

  function setError(input, errorId, hasError) {
    const group = input.closest('.form-group');
    if (!group) return;

    if (hasError) {
      group.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
    } else {
      group.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
    }
  }

  // Clear error on input
  [nameInput, emailInput, messageInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      setError(input, null, false);
      hideAllNotices();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (isSubmitting) return;

    hideAllNotices();

    // Validate fields
    let isValid = true;

    // 1. Name validation
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (!nameVal) {
      setError(nameInput, 'error-name', true);
      if (isValid && nameInput) nameInput.focus();
      isValid = false;
    } else {
      setError(nameInput, 'error-name', false);
    }

    // 2. Email validation
    const emailVal = emailInput ? emailInput.value.trim() : '';
    if (!emailVal || !EMAIL_REGEX.test(emailVal)) {
      setError(emailInput, 'error-email', true);
      if (isValid && emailInput) emailInput.focus();
      isValid = false;
    } else {
      setError(emailInput, 'error-email', false);
    }

    // 3. Message validation
    const messageVal = messageInput ? messageInput.value.trim() : '';
    if (!messageVal) {
      setError(messageInput, 'error-message', true);
      if (isValid && messageInput) messageInput.focus();
      isValid = false;
    } else {
      setError(messageInput, 'error-message', false);
    }

    if (!isValid) return;

    // Payload construction
    const payload = {
      name: nameVal,
      email: emailVal,
      project_type: typeSelect ? typeSelect.value : '',
      location: locationInput ? locationInput.value.trim() : '',
      message: messageVal,
      timestamp: new Date().toISOString()
    };

    // Duplicate submission protection
    isSubmitting = true;
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending enquiry...';

    // Check if live backend endpoint is configured
    if (!FORM_ENDPOINT) {
      // No backend endpoint configured yet.
      // Do NOT fake success; honestly display the configuration notice.
      setTimeout(function () {
        if (noticeConfig) {
          noticeConfig.classList.add('is-visible');
          noticeConfig.focus();
        }
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        isSubmitting = false;
      }, 400);
      return;
    }

    // Live endpoint submission
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (response.ok) {
          if (noticeSuccess) {
            noticeSuccess.classList.add('is-visible');
            noticeSuccess.focus();
          }
          form.reset();
        } else {
          throw new Error('Server returned ' + response.status);
        }
      })
      .catch(function () {
        if (noticeError) {
          noticeError.classList.add('is-visible');
          noticeError.focus();
        }
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        isSubmitting = false;
      });
  });

}());
