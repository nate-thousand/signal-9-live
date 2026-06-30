const MENU_OPEN_ATTR = 'data-s9-menu-open';

export function mountControlMenu(instrumentRoot: HTMLElement): HTMLElement {
  const existing = instrumentRoot.querySelector<HTMLElement>('.s9-control-menu');
  if (existing) return existing.querySelector<HTMLElement>('.s9-control-menu__panels') ?? existing;

  const menu = document.createElement('div');
  menu.className = 's9-control-menu';
  menu.setAttribute(MENU_OPEN_ATTR, 'false');
  menu.setAttribute('role', 'region');
  menu.setAttribute('aria-label', 'Signal 9 controls');

  const panels = document.createElement('div');
  panels.className = 's9-control-menu__panels';
  panels.id = 's9-control-menu-panels';
  panels.hidden = true;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 's9-control-menu__toggle';
  toggle.textContent = 'Menu';
  toggle.setAttribute('aria-controls', 's9-control-menu-panels');
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const open = menu.getAttribute(MENU_OPEN_ATTR) === 'true';
    const next = !open;
    menu.setAttribute(MENU_OPEN_ATTR, next ? 'true' : 'false');
    panels.hidden = !next;
    toggle.setAttribute('aria-expanded', next ? 'true' : 'false');
  });

  menu.append(panels, toggle);
  instrumentRoot.appendChild(menu);

  return panels;
}

export function isControlMenuOpen(instrumentRoot: ParentNode): boolean {
  const menu = instrumentRoot.querySelector<HTMLElement>('.s9-control-menu');
  return menu?.getAttribute(MENU_OPEN_ATTR) === 'true';
}
