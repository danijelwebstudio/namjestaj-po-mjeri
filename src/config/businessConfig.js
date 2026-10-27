import { projectBriefConfig } from '../../shared/projectBriefConfig.js';
import { servicesConfig } from './servicesConfig.js';
import { workConfig } from './workConfig.js';
import { processConfig } from './processConfig.js';
import { benefitsConfig } from './benefitsConfig.js';
import { materialsConfig } from './materialsConfig.js';
import { briefIntroConfig } from './briefIntroConfig.js';

// All business-specific copy, visual tokens and future brief options live here.
// Replace the demo identity and contact details with the actual company's data.
export const businessConfig = {
  brand: {
    name: 'Namještaj po mjeri',
    shortName: 'PO MJERI',
    descriptor: 'Enterijeri po vašoj mjeri',
    logoUrl: null,
  },
  contact: {
    phone: '',
    whatsapp: '',
    email: '',
    location: '',
  },
  theme: {
    background: '#f3efe8',
    paper: '#f8f5f0',
    text: '#24211e',
    muted: '#79746e',
    accent: '#705747',
    line: '#d9d1c7',
  },
  navigation: [
    { id: 'sta-radimo', label: 'Šta radimo', href: '#sta-radimo' },
    { id: 'kako-radimo', label: 'Kako radimo', href: '#kako-radimo' },
  ],
  hero: {
    eyebrow: 'NAMJEŠTAJ PO MJERI',
    title: 'Namještaj po mjeri za vaš prostor.',
    description:
      'Kuhinje, plakari i komode za stan, kuću ili poslovni prostor.',
    primaryCta: 'Opiši svoj projekat',
    helper: '5 koraka · pregled prije slanja',
    caption: 'Primjer enterijera · inspiracija',
    imageUrl: '/src/assets/images/hero-main.jpg',
    imageAlt: 'Enterijer opremljen namještajem po mjeri',
  },
  services: servicesConfig,
  work: workConfig,
  process: processConfig,
  benefits: benefitsConfig,
  materials: materialsConfig,
  briefIntro: briefIntroConfig,
  projectBrief: projectBriefConfig,
};
