(function () {
  'use strict';

  var wrap = document.querySelector('[data-lang-switch]');
  if (!wrap) return;

  var btn = wrap.querySelector('.lang-btn');
  var menu = wrap.querySelector('.lang-menu');

  function setOpen(open) {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(menu.hidden);
  });

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      btn.focus();
    }
  });
})();
