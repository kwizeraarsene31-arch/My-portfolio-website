/* script.js — theme, menu, smooth scroll, form handling, toasts */
(function(){
  'use strict';

  // --- elements ---
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const navList = document.getElementById('primaryNavList');
  const toastEl = document.getElementById('toast');
  const yearEls = document.querySelectorAll('#year, #yearAbout, #yearProjects, #yearContact');

  // --- utilities ---
  function showToast(msg, ms = 3500){
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(()=> { toastEl.style.display = 'none'; }, ms);
  }

  // set years
  function setYears(){ const y = new Date().getFullYear(); yearEls.forEach(e => { if(e) e.textContent = y; }); }
  setYears();

  // --- theme management ---
  const THEME_KEY = 'site_theme'; // 'dark' | 'light'
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme){
    if(theme === 'dark') body.classList.add('dark-mode');
    else body.classList.remove('dark-mode');

    // aria pressed
    if(themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  function loadTheme(){
    const stored = localStorage.getItem(THEME_KEY);
    if(stored === 'dark' || stored === 'light') applyTheme(stored);
    else applyTheme(prefersDark ? 'dark' : 'light');
  }

  function toggleTheme(){
    const isDark = body.classList.contains('dark-mode');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
    showToast(isDark ? 'Switched to light mode' : 'Switched to dark mode');
  }

  // init theme
  loadTheme();
  if(themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // --- mobile nav toggle ---
  if(menuToggle && navList){
    menuToggle.addEventListener('click', function(){
      const isOpen = navList.classList.toggle('active');
      navList.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // trap focus not necessary for simple nav, progressive enhancement
    });

    // close nav when clicking a link (mobile)
    navList.addEventListener('click', (e) => {
      if(e.target.tagName === 'A' && navList.classList.contains('active')){
        navList.classList.remove('active');
        navList.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- smooth scroll for local anchors ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length === 1) return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          target.scrollIntoView(true);
        } else {
          target.scrollIntoView({behavior:'smooth', block:'start'});
        }
      }
    });
  });

  // --- feedback form handling (graceful) ---
  const feedbackForm = document.getElementById('feedbackForm');
  if(feedbackForm){
    feedbackForm.addEventListener('submit', async function(e){
      e.preventDefault();

      // Build form data
      const fd = new FormData(feedbackForm);
      const action = feedbackForm.getAttribute('action') || '';
      // If action is Formspree placeholder, fallback to mailto
      if(action.includes('YOUR_FORMSPREE_ID') || action.trim() === ''){
        // fallback: open mail client
        const name = fd.get('name') || '';
        const email = fd.get('email') || '';
        const message = fd.get('message') || '';
        const subject = encodeURIComponent('Feedback from portfolio site');
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
        return;
      }

      // Disable form while sending
      const submitBtn = feedbackForm.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.disabled = true;

      try{
        const res = await fetch(action, {
          method: 'POST',
          body: fd,
          headers: {
            'Accept': 'application/json'
          }
        });
        if(res.ok){
          feedbackForm.reset();
          showToast('Thanks — feedback sent!');
        } else {
          const data = await res.json();
          showToast(data.error || 'Error sending feedback — try email.');
        }
      } catch(err){
        showToast('Network error — try again or email me directly.');
      } finally {
        if(submitBtn) submitBtn.disabled = false;
      }
    });

    const clearBtn = document.getElementById('clearForm');
    if(clearBtn){
      clearBtn.addEventListener('click', () => feedbackForm.reset());
    }
  }

  // --- small accessibility improvement: enable keyboard menu toggle by Enter/Space ---
  if(menuToggle){
    menuToggle.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menuToggle.click(); }
    });
  }

})();
