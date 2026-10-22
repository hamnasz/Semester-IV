import { el, esc } from '../core/dom.js';
import { href } from '../core/router.js';
import { iconEl } from '../core/icons.js';
import { subjectInfo } from '../core/repo.js';
import { plural, formatDate } from '../core/format.js';

export function SubjectCard(dir) {
  const info = subjectInfo(dir);
  const card = el('a', { class: 'subject-card', href: href.browse(dir.path), style: `--hue:${info.hue}` }, [
    el('div', { class: 'subject-card__top' }, [
      el('span', { class: 'subject-card__tile', 'aria-hidden': 'true' }, iconEl('folder')),
      el('span', { class: 'subject-card__arrow', 'aria-hidden': 'true' }, iconEl('chevron')),
    ]),
    el('h3', { class: 'subject-card__title font-serif' }, info.title),
    info.custom ? el('p', { class: 'subject-card__desc' }, info.description) : null,
    el('div', { class: 'subject-card__meta' }, [
      dir.restricted ? el('span', { class: 'badge-restricted' }, [iconEl('lock'), 'View only']) : null,
      el('span', {}, plural(dir.fileCount, 'file')),
      dir.dirCount ? el('span', {}, plural(dir.dirCount, 'folder')) : null,
      dir.modified ? el('span', {}, `Updated ${formatDate(dir.modified)}`) : null,
    ].filter(Boolean)),
  ].filter(Boolean));
  return card;
}
