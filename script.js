// Comportement partagé du site (démo, sans backend).

document.addEventListener('DOMContentLoaded', () => {
  const I18N = Object.assign(
    {
      msgRequired: 'Dieses Feld wird benötigt.',
      msgInvalidEmail: 'Bitte eine gültige E-Mail-Adresse eingeben.',
      contactConfirmTpl: 'Danke, {name}. Ihre Nachricht wurde erfasst. Demo — es wird aktuell nichts versendet.',
      reservationConfirmTpl: 'Danke, {name}. Reservierungsanfrage für {guests} Personen am {date} um {time} Uhr erfasst. Demo — es wird aktuell nichts versendet.',
    },
    window.SITE_I18N || {}
  );
  const fillTpl = (tpl, values) => tpl.replace(/\{(\w+)\}/g, (m, key) => (key in values ? values[key] : m));

  /* ---------- Cookie-Banner ---------- */
  const cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    const COOKIE_CONSENT_KEY = 'site_cookie_consent';
    let consent = null;
    try {
      consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
      consent = null;
    }

    if (!consent) {
      cookieBanner.removeAttribute('hidden');
      requestAnimationFrame(() => {
        cookieBanner.classList.add('show');
        document.body.classList.add('cookie-banner-open');
      });
    }

    const setCookieConsent = (value) => {
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, value);
      } catch (e) {
        /* localStorage indisponible — le bandeau réapparaîtra au prochain chargement */
      }
      cookieBanner.classList.remove('show');
      document.body.classList.remove('cookie-banner-open');
      window.setTimeout(() => cookieBanner.setAttribute('hidden', ''), 400);
    };

    const cookieAcceptBtn = document.getElementById('cookie-accept');
    const cookieDeclineBtn = document.getElementById('cookie-decline');
    if (cookieAcceptBtn) cookieAcceptBtn.addEventListener('click', () => setCookieConsent('accepted'));
    if (cookieDeclineBtn) cookieDeclineBtn.addEventListener('click', () => setCookieConsent('declined'));
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const navInner = document.querySelector('.nav-inner');
  if (toggle && navInner) {
    toggle.addEventListener('click', () => {
      const isOpen = navInner.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------- Révélation au scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  document.querySelectorAll('.reveal-stagger').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
      child.classList.add('reveal');
    });
  });

  /* ---------- Validation de formulaire (inline, sans alert()) ---------- */
  function attachValidation(form) {
    if (!form) return null;

    const showError = (field, message) => {
      field.setAttribute('aria-invalid', 'true');
      const errorEl = form.querySelector(`[data-error-for="${field.id}"]`);
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
      }
    };
    const clearError = (field) => {
      field.removeAttribute('aria-invalid');
      const errorEl = form.querySelector(`[data-error-for="${field.id}"]`);
      if (errorEl) errorEl.classList.remove('show');
    };

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('blur', () => {
        if (field.hasAttribute('required') && !field.value.trim()) {
          showError(field, I18N.msgRequired);
        } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          showError(field, I18N.msgInvalidEmail);
        }
      });
    });

    return function validate() {
      let valid = true;
      form.querySelectorAll('input, textarea').forEach((field) => {
        if (field.hasAttribute('required') && !field.value.trim()) {
          showError(field, I18N.msgRequired);
          valid = false;
        } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          showError(field, I18N.msgInvalidEmail);
          valid = false;
        } else {
          clearError(field);
        }
      });
      return valid;
    };
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const validate = attachValidation(contactForm);
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validate()) return;
      const name = document.getElementById('contact-name').value.trim();
      const confirmation = document.getElementById('contact-confirmation');
      confirmation.textContent = fillTpl(I18N.contactConfirmTpl, { name });
      confirmation.classList.add('show');
      contactForm.reset();
    });
  }

  const reservationForm = document.getElementById('reservation-form');
  if (reservationForm) {
    const validate = attachValidation(reservationForm);
    reservationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validate()) return;
      const name = document.getElementById('res-name').value.trim();
      const date = document.getElementById('res-date').value;
      const time = document.getElementById('res-time').value;
      const guests = document.getElementById('res-guests').value;
      const confirmation = document.getElementById('reservation-confirmation');
      confirmation.textContent = fillTpl(I18N.reservationConfirmTpl, { name, guests, date, time });
      confirmation.classList.add('show');
      reservationForm.reset();
    });
  }
});
