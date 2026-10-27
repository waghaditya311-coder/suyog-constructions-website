/**
 * Suyog Constructions — contact.js
 * Handles contact form and inquiry form validation + submission
 */
(function () {
  'use strict';

  // ── Validation Utilities ──────────────────────────────────────────────────
  const validators = {
    required: (v) => v.trim().length > 0,
    minLength: (min) => (v) => v.trim().length >= min,
    maxLength: (max) => (v) => v.trim().length <= max,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: (v) => /^[6-9]\d{9}$/.test(v.trim()),
  };

  function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(errorId);
    field?.classList.add('error');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('visible');
    }
  }

  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(errorId);
    field?.classList.remove('error');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('visible');
    }
  }

  function setLoading(btn, loading) {
    if (loading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = `<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Sending...`;
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
      btn.disabled = false;
    }
  }

  // ── Live validation on blur ────────────────────────────────────────────────
  function attachLiveValidation(fieldId, errorId, validateFn, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.addEventListener('blur', () => {
      if (!validateFn(field.value)) {
        showError(fieldId, errorId, message);
      } else {
        clearError(fieldId, errorId);
      }
    });
    field.addEventListener('input', () => {
      if (validateFn(field.value)) {
        clearError(fieldId, errorId);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CONTACT FORM
  // ══════════════════════════════════════════════════════════════════════════
  const contactForm  = document.getElementById('contact-form');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');
  const contactSuccess   = document.getElementById('contact-success');

  if (contactForm) {
    // Live validations
    attachLiveValidation('contact-name', 'error-contact-name', v => v.trim().length >= 2, 'Name must be at least 2 characters');
    attachLiveValidation('contact-email', 'error-contact-email', validators.email, 'Please enter a valid email address');
    attachLiveValidation('contact-phone', 'error-contact-phone', v => !v || validators.phone(v), 'Enter a valid 10-digit mobile number');
    attachLiveValidation('contact-subject', 'error-contact-subject', v => v.trim().length >= 3, 'Subject must be at least 3 characters');
    attachLiveValidation('contact-message', 'error-contact-message', v => v.trim().length >= 10, 'Message must be at least 10 characters');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      let hasErrors = false;

      const name    = document.getElementById('contact-name').value;
      const email   = document.getElementById('contact-email').value;
      const phone   = document.getElementById('contact-phone').value;
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value;

      if (name.trim().length < 2) {
        showError('contact-name', 'error-contact-name', 'Name must be at least 2 characters');
        hasErrors = true;
      } else { clearError('contact-name', 'error-contact-name'); }

      if (!validators.email(email)) {
        showError('contact-email', 'error-contact-email', 'Please enter a valid email address');
        hasErrors = true;
      } else { clearError('contact-email', 'error-contact-email'); }

      if (phone && !validators.phone(phone)) {
        showError('contact-phone', 'error-contact-phone', 'Please enter a valid 10-digit mobile number');
        hasErrors = true;
      } else { clearError('contact-phone', 'error-contact-phone'); }

      if (subject.trim().length < 3) {
        showError('contact-subject', 'error-contact-subject', 'Subject is required');
        hasErrors = true;
      } else { clearError('contact-subject', 'error-contact-subject'); }

      if (message.trim().length < 10) {
        showError('contact-message', 'error-contact-message', 'Message must be at least 10 characters');
        hasErrors = true;
      } else { clearError('contact-message', 'error-contact-message'); }

      if (hasErrors) return;

      setLoading(contactSubmitBtn, true);

      try {
        const res = await fetch('/api/v1/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone: phone || undefined, subject, message }),
        });

        const data = await res.json();

        if (data.success) {
          contactForm.style.display = 'none';
          contactSuccess.classList.add('visible');
          window.showToast?.('Message sent successfully! We\'ll get back to you shortly.', 'success');
        } else {
          // Show server-side validation errors
          if (data.errors) {
            Object.entries(data.errors).forEach(([field, msg]) => {
              showError(`contact-${field}`, `error-contact-${field}`, msg);
            });
          }
          window.showToast?.(data.message || 'Failed to send message. Please try again.', 'error');
        }
      } catch (err) {
        console.error('[CONTACT]', err);
        window.showToast?.('Network error. Please check your connection and try again.', 'error');
      } finally {
        setLoading(contactSubmitBtn, false);
      }
    });
  }


  // ══════════════════════════════════════════════════════════════════════════
  // INQUIRY FORM
  // ══════════════════════════════════════════════════════════════════════════
  const inquiryForm   = document.getElementById('inquiry-form');
  const inquirySubmit = document.getElementById('inquiry-submit-btn');
  const inquirySuccess = document.getElementById('inquiry-success');

  if (inquiryForm) {
    // Live validations
    attachLiveValidation('inq-name', 'error-inq-name', v => v.trim().length >= 2, 'Name must be at least 2 characters');
    attachLiveValidation('inq-email', 'error-inq-email', validators.email, 'Please enter a valid email address');
    attachLiveValidation('inq-phone', 'error-inq-phone', validators.phone, 'Enter a valid 10-digit mobile number');
    attachLiveValidation('inq-service', 'error-inq-service', v => v !== '', 'Please select a service type');
    attachLiveValidation('inq-message', 'error-inq-message', v => v.trim().length >= 10, 'Please describe your project (min 10 characters)');

    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasErrors = false;

      const name             = document.getElementById('inq-name').value;
      const email            = document.getElementById('inq-email').value;
      const phone            = document.getElementById('inq-phone').value;
      const service_type     = document.getElementById('inq-service').value;
      const budget_range     = document.getElementById('inq-budget').value;
      const project_location = document.getElementById('inq-location').value;
      const message          = document.getElementById('inq-message').value;

      if (name.trim().length < 2) {
        showError('inq-name', 'error-inq-name', 'Name must be at least 2 characters');
        hasErrors = true;
      } else { clearError('inq-name', 'error-inq-name'); }

      if (!validators.email(email)) {
        showError('inq-email', 'error-inq-email', 'Please enter a valid email address');
        hasErrors = true;
      } else { clearError('inq-email', 'error-inq-email'); }

      if (!validators.phone(phone)) {
        showError('inq-phone', 'error-inq-phone', 'Please enter a valid 10-digit mobile number');
        hasErrors = true;
      } else { clearError('inq-phone', 'error-inq-phone'); }

      if (!service_type) {
        showError('inq-service', 'error-inq-service', 'Please select the type of service required');
        hasErrors = true;
      } else { clearError('inq-service', 'error-inq-service'); }

      if (message.trim().length < 10) {
        showError('inq-message', 'error-inq-message', 'Please describe your project (at least 10 characters)');
        hasErrors = true;
      } else { clearError('inq-message', 'error-inq-message'); }

      if (hasErrors) {
        // Scroll to first error
        const firstError = inquiryForm.querySelector('.form-control.error');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setLoading(inquirySubmit, true);

      try {
        const payload = { name, email, phone, service_type, message };
        if (budget_range)     payload.budget_range     = budget_range;
        if (project_location) payload.project_location = project_location;

        const res = await fetch('/api/v1/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success) {
          inquiryForm.style.display = 'none';
          inquirySuccess.classList.add('visible');
          window.showToast?.('🎉 Your inquiry has been submitted! We\'ll contact you within 24 hours.', 'success', 7000);
        } else {
          if (data.errors) {
            Object.entries(data.errors).forEach(([field, msg]) => {
              const fieldMap = { service_type: 'service', budget_range: 'budget', project_location: 'location' };
              const fId = fieldMap[field] || field;
              showError(`inq-${fId}`, `error-inq-${fId}`, msg);
            });
          }
          window.showToast?.(data.message || 'Submission failed. Please try again.', 'error');
        }
      } catch (err) {
        console.error('[INQUIRY]', err);
        window.showToast?.('Network error. Please check your connection and try again.', 'error');
      } finally {
        setLoading(inquirySubmit, false);
      }
    });
  }

})();
