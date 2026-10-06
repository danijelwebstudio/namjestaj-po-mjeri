export const briefIntroConfig = {
  id: 'project-brief',
  eyebrow: 'VAŠ PROJEKAT',
  title: 'Počnimo od informacija koje stvarno pomažu.',
  description: 'Kratak vođeni upit pomaže da razumijemo prostor, vaše potrebe i koliko je projekat spreman za naredni razgovor.',
  note: 'Ne morate znati sve odgovore. Ako nemate mjere, nacrt ili definisan materijal, jednostavno to označite tokom upita.',
  items: [
    { id: 'project', number: '01', title: 'Šta želite da radite', description: 'Vrsta namještaja, prostor i ono što želite postići.' },
    { id: 'information', number: '02', title: 'Šta već imate', description: 'Mjere, fotografije, skica ili samo početna ideja.' },
    { id: 'expectations', number: '03', title: 'Šta vam je važno', description: 'Prioriteti, okvirni budžet, željeni rok i potrebne usluge.' },
  ],
  action: { label: 'Započni svoj projekat', helper: '5 kratkih koraka · pregled prije slanja', pendingMessage: 'Smart Project Brief' },
  disclaimer: 'Upit služi za pripremu razgovora. Konačna ponuda zahtijeva potvrđene mjere i dogovoreno rješenje.',
};
