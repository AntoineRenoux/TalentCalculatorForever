(() => {
  const groups = [...document.querySelectorAll('.nav-groupe')];
  const setOpen = (group, open) => {
    const button = group.querySelector('.nav-toggle');
    const menu = group.querySelector('.nav-menu');
    button.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  groups.forEach(group => {
    const button = group.querySelector('.nav-toggle');
    button.addEventListener('click', () => {
      const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const open = hoverPointer && group.matches(':hover')
        ? true
        : button.getAttribute('aria-expanded') !== 'true';
      groups.forEach(other => setOpen(other, other === group && open));
    });
    group.addEventListener('mouseenter', () => groups.forEach(other => setOpen(other, other === group)));
    group.addEventListener('mouseleave', () => {
      if (!group.contains(document.activeElement)) setOpen(group, false);
    });
    group.addEventListener('focusin', event => {
      // Do not reopen when Escape returns focus to the toggle; entering a menu item keeps it open.
      if (event.target !== button) groups.forEach(other => setOpen(other, other === group));
    });
    group.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (!group.contains(document.activeElement)) setOpen(group, false);
      }, 0);
    });
    group.querySelectorAll('.nav-menu a').forEach(link => link.addEventListener('click', () => setOpen(group, false)));
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('nav.site')) groups.forEach(group => setOpen(group, false));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const openGroup = groups.find(group => group.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'true');
      if (openGroup) { setOpen(openGroup, false); openGroup.querySelector('.nav-toggle').focus(); }
    }
  });
})();
