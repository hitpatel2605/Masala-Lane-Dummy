/**
 * MASALA LANE KITCHEN - MAIN JAVASCRIPT
 * Plain vanilla JavaScript, zero dependencies, accessible & fast
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initStickyHeader();
  initHoursHighlight();
  initMenuFilter();
  initContactForms();
  initDateConstraints();
});

/* ==========================================================================
   1. Mobile Navigation Toggle & Accessibility
   ========================================================================== */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (!hamburger || !mobileNav) return;

  function toggleMenu(show) {
    const isExpanded = show !== undefined ? show : hamburger.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;

    hamburger.setAttribute('aria-expanded', String(nextState));
    if (nextState) {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close on nav link click
  const navLinks = mobileNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      toggleMenu(false);
      hamburger.focus();
    }
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (
      hamburger.getAttribute('aria-expanded') === 'true' &&
      !mobileNav.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   2. Sticky Header Elevation Shadow
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   3. Highlight Today's Hours in Table
   ========================================================================== */
function initHoursHighlight() {
  const hoursTables = document.querySelectorAll('.hours-table');
  if (!hoursTables.length) return;

  const currentDay = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  // Map JS getDay() to row indices:
  // Mon-Thu row: 1, 2, 3, 4 -> index 0
  // Fri row: 5 -> index 1
  // Sat row: 6 -> index 2
  // Sun row: 0 -> index 3
  let targetRowIndex = 0;
  if (currentDay >= 1 && currentDay <= 4) targetRowIndex = 0;
  else if (currentDay === 5) targetRowIndex = 1;
  else if (currentDay === 6) targetRowIndex = 2;
  else if (currentDay === 0) targetRowIndex = 3;

  hoursTables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr');
    if (rows[targetRowIndex]) {
      rows[targetRowIndex].classList.add('today-row');
      const dayCell = rows[targetRowIndex].querySelector('td:first-child');
      if (dayCell && !dayCell.textContent.includes('(Today)')) {
        dayCell.innerHTML += ' <span style="font-size:0.8em; color:var(--color-saffron-dark); font-weight:700;">(Today)</span>';
      }
    }
  });
}

/* ==========================================================================
   4. Menu Category Filtering (menu.html)
   ========================================================================== */
function initMenuFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const categorySections = document.querySelectorAll('.menu-category-section');

  if (!filterButtons.length || !categorySections.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCategory = btn.getAttribute('data-category');

      // Update active button
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Filter sections
      categorySections.forEach(section => {
        const sectionCategory = section.getAttribute('data-category');
        if (targetCategory === 'all' || sectionCategory === targetCategory) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   5. Form Validation & Submissions (contact.html)
   ========================================================================== */
function initContactForms() {
  // Tab switching: Reservation vs Catering
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.form-panel');

  if (tabButtons.length && panels.length) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const activePanel = document.getElementById(`panel-${targetTab}`);
        if (activePanel) activePanel.classList.add('active');
      });
    });

    // Handle URL hash jumping (e.g. contact.html#catering or contact.html#reserve)
    if (window.location.hash === '#catering') {
      const cateringTab = document.querySelector('[data-tab="catering"]');
      if (cateringTab) cateringTab.click();
    }
  }

  // Reservation Form
  const reserveForm = document.getElementById('reservation-form');
  if (reserveForm) {
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateReservationForm(reserveForm)) {
        handleReservationSuccess(reserveForm);
      }
    });

    // Clear error on input
    reserveForm.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('invalid'));
      input.addEventListener('change', () => input.classList.remove('invalid'));
    });
  }

  // Catering Form
  const cateringForm = document.getElementById('catering-form');
  if (cateringForm) {
    cateringForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateCateringForm(cateringForm)) {
        handleCateringSuccess(cateringForm);
      }
    });

    cateringForm.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('invalid'));
      input.addEventListener('change', () => input.classList.remove('invalid'));
    });
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
}

function validateReservationForm(form) {
  let isValid = true;
  const name = form.querySelector('#res-name');
  const email = form.querySelector('#res-email');
  const phone = form.querySelector('#res-phone');
  const date = form.querySelector('#res-date');
  const time = form.querySelector('#res-time');
  const guests = form.querySelector('#res-guests');

  if (!name.value.trim() || name.value.trim().length < 2) {
    name.classList.add('invalid');
    isValid = false;
  }
  if (!email.value.trim() || !validateEmail(email.value.trim())) {
    email.classList.add('invalid');
    isValid = false;
  }
  if (!phone.value.trim() || !validatePhone(phone.value.trim())) {
    phone.classList.add('invalid');
    isValid = false;
  }
  if (!date.value) {
    date.classList.add('invalid');
    isValid = false;
  }
  if (!time.value) {
    time.classList.add('invalid');
    isValid = false;
  }
  if (!guests.value || Number(guests.value) < 1) {
    guests.classList.add('invalid');
    isValid = false;
  }

  if (!isValid) {
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) firstInvalid.focus();
  }
  return isValid;
}

function handleReservationSuccess(form) {
  /**
   * INTEGRATION NOTE FOR REAL CLIENT DEPLOYMENT:
   * To connect to a live backend form service (e.g. Formspree, Formkeep, Netlify Forms):
   *
   * Example with Formspree:
   * const formData = new FormData(form);
   * fetch("https://formspree.io/f/YOUR_FORMSPREE_ID", {
   *   method: "POST",
   *   body: formData,
   *   headers: { "Accept": "application/json" }
   * }).then(res => res.json()).then(data => { ... });
   */

  const nameVal = form.querySelector('#res-name').value;
  const dateVal = form.querySelector('#res-date').value;
  const timeVal = form.querySelector('#res-time').value;
  const guestsVal = form.querySelector('#res-guests').value;
  const confirmationRef = 'MLK-' + Math.floor(10000 + Math.random() * 90000);

  const feedback = document.getElementById('reservation-feedback');
  if (feedback) {
    feedback.innerHTML = `
      <div class="feedback-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Table Reserved Successfully!</span>
      </div>
      <p class="feedback-details">
        Thank you, <strong>${escapeHtml(nameVal)}</strong>! We have reserved a table for <strong>${escapeHtml(guestsVal)} guests</strong> on <strong>${escapeHtml(dateVal)}</strong> at <strong>${escapeHtml(timeVal)}</strong>.
      </p>
      <p class="feedback-details" style="margin-top:0.5rem; font-size:0.9rem;">
        Confirmation Code: <strong>${confirmationRef}</strong>. A confirmation email and text reminder will be sent shortly. We look forward to welcoming you to Masala Lane Kitchen!
      </p>
    `;
    feedback.classList.add('show');
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.reset();
}

function validateCateringForm(form) {
  let isValid = true;
  const name = form.querySelector('#cat-name');
  const email = form.querySelector('#cat-email');
  const phone = form.querySelector('#cat-phone');
  const eventDate = form.querySelector('#cat-date');
  const guestCount = form.querySelector('#cat-guests');
  const eventType = form.querySelector('#cat-type');
  const message = form.querySelector('#cat-message');

  if (!name.value.trim() || name.value.trim().length < 2) {
    name.classList.add('invalid');
    isValid = false;
  }
  if (!email.value.trim() || !validateEmail(email.value.trim())) {
    email.classList.add('invalid');
    isValid = false;
  }
  if (!phone.value.trim() || !validatePhone(phone.value.trim())) {
    phone.classList.add('invalid');
    isValid = false;
  }
  if (!eventDate.value) {
    eventDate.classList.add('invalid');
    isValid = false;
  }
  if (!guestCount.value || Number(guestCount.value) < 5) {
    guestCount.classList.add('invalid');
    isValid = false;
  }
  if (!eventType.value) {
    eventType.classList.add('invalid');
    isValid = false;
  }
  if (!message.value.trim() || message.value.trim().length < 10) {
    message.classList.add('invalid');
    isValid = false;
  }

  if (!isValid) {
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) firstInvalid.focus();
  }
  return isValid;
}

function handleCateringSuccess(form) {
  const nameVal = form.querySelector('#cat-name').value;
  const guestsVal = form.querySelector('#cat-guests').value;
  const dateVal = form.querySelector('#cat-date').value;
  const inquiryRef = 'CAT-' + Math.floor(10000 + Math.random() * 90000);

  const feedback = document.getElementById('catering-feedback');
  if (feedback) {
    feedback.innerHTML = `
      <div class="feedback-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Catering Inquiry Received!</span>
      </div>
      <p class="feedback-details">
        Thank you, <strong>${escapeHtml(nameVal)}</strong>! We received your inquiry for <strong>${escapeHtml(guestsVal)} guests</strong> on <strong>${escapeHtml(dateVal)}</strong>.
      </p>
      <p class="feedback-details" style="margin-top:0.5rem; font-size:0.9rem;">
        Inquiry Reference: <strong>${inquiryRef}</strong>. Chef Rajan and our events director will review your details and respond within 24 hours with a custom proposal and sample menu.
      </p>
    `;
    feedback.classList.add('show');
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.reset();
}

/* ==========================================================================
   6. Date Field Minimum Constraint (today onwards)
   ========================================================================== */
function initDateConstraints() {
  const todayStr = new Date().toISOString().split('T')[0];
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    input.setAttribute('min', todayStr);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}
