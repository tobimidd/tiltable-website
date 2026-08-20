/**
 * Tiltable — waitlist form (waitlist.html only).
 *
 * Set WAITLIST_ENDPOINT to a real form-handling URL (Formspree, Tally,
 * Google Forms, your own backend...) to submit for real. While it still
 * holds the placeholder below, the form runs in demo mode: full client-side
 * validation runs as normal, but submission just simulates a short delay
 * and shows the success state — nothing is sent over the network.
 * See README.md for how to plug in a real endpoint.
 */
const WAITLIST_ENDPOINT = "[replace-with-form-endpoint]";

(function () {
  const form = document.getElementById('waitlist-form');
  if (!form) return;

  const successPanel = document.getElementById('waitlist-success');
  const submitBtn = form.querySelector('[type="submit"]');
  const formError = document.getElementById('form-error');

  const nameEl = document.getElementById('field-name');
  const emailEl = document.getElementById('field-email');
  const restaurantEl = document.getElementById('field-restaurant');
  const tablesEl = document.getElementById('field-tables');
  const consentEl = document.getElementById('field-consent');

  function setError(inputEl, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (message) {
      inputEl.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    } else {
      inputEl.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validate() {
    let firstInvalid = null;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameEl.value.trim()) {
      setError(nameEl, 'error-name', 'Please enter your name.');
      firstInvalid = firstInvalid || nameEl;
    } else {
      setError(nameEl, 'error-name', '');
    }

    const email = emailEl.value.trim();
    if (!email) {
      setError(emailEl, 'error-email', 'Please enter your email.');
      firstInvalid = firstInvalid || emailEl;
    } else if (!emailPattern.test(email)) {
      setError(emailEl, 'error-email', "That email address doesn't look right.");
      firstInvalid = firstInvalid || emailEl;
    } else {
      setError(emailEl, 'error-email', '');
    }

    if (!consentEl.checked) {
      setError(consentEl, 'error-consent', 'We need your consent to get in touch.');
      firstInvalid = firstInvalid || consentEl;
    } else {
      setError(consentEl, 'error-consent', '');
    }

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (formError) formError.textContent = '';
    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    const payload = {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      restaurant: restaurantEl.value.trim(),
      tables: tablesEl.value,
      consent: consentEl.checked,
      submittedAt: new Date().toISOString(),
    };

    try {
      if (WAITLIST_ENDPOINT === '[replace-with-form-endpoint]') {
        await new Promise((resolve) => setTimeout(resolve, 700)); // demo mode, no network call
      } else {
        const response = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Request failed with status ' + response.status);
      }
      form.hidden = true;
      if (successPanel) successPanel.hidden = false;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      if (formError) formError.textContent = 'Something went wrong sending that — please try again in a moment.';
    }
  });
})();
