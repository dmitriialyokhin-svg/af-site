const base = import.meta.env.BASE_URL

const cards = [
  {
    title: { en: 'Act I',      ru: 'Акт I' },
    src:   `${base}previews/act1.webm`,
    tags:  ['Featured', 'Horizontal', 'Advanced'],
  },
  {
    title: { en: 'Mace Trial', ru: 'Испытание Булавой' },
    src:   `${base}previews/macetrial.webm`,
    tags:  ['Featured', 'Horizontal', 'Pro'],
  },
  {
    title: { en: 'Primer 1',   ru: 'Праймер 1' },
    src:   `${base}previews/primer1.webm`,
    tags:  ['Vertical', 'Easy'],
  },
  {
    title: { en: 'Out',        ru: 'Аут' },
    src:   `${base}previews/out.webm`,
    tags:  ['Horizontal', 'Lite'],
  },
  {
    title: { en: 'Primer 2',   ru: 'Праймер 2' },
    src:   `${base}previews/primer2.webm`,
    tags:  ['Vertical', 'Easy'],
  },
  {
    title: { en: 'ZF Short',   ru: 'ZF Короткий' },
    src:   `${base}previews/ZF_short.webm`,
    tags:  ['Featured', 'Vertical', 'Advanced'],
  },
  {
    title: { en: 'Video',      ru: 'Видео' },
    src:   `${base}previews/video.webm`,
    tags:  ['Horizontal', 'Lite'],
  },
]

export default cards
