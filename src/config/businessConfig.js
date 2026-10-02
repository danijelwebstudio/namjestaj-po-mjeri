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
    { id: 'radovi', label: 'Radovi', href: '#radovi' },
    { id: 'sta-radimo', label: 'Šta radimo', href: '#sta-radimo' },
    { id: 'kako-radimo', label: 'Kako radimo', href: '#kako-radimo' },
    { id: 'o-nama', label: 'O nama' },
    { id: 'kontakt', label: 'Kontakt' },
  ],
  hero: {
    eyebrow: 'NAMJEŠTAJ PO MJERI',
    title: 'Prostor napravljen po vašoj mjeri.',
    description:
      'Kuhinje, plakari, dnevni boravci i custom komadi prilagođeni vašem prostoru, potrebama i načinu života.',
    primaryCta: 'Započni svoj projekat',
    primaryHref: '#project-brief',
    secondaryCta: 'Pogledaj radove',
    secondaryHref: '#radovi',
    imageUrl: '/src/assets/images/hero-main.jpg',
    imageAlt: 'Enterijer opremljen namještajem po mjeri',
  },
  services: servicesConfig,
  work: workConfig,
  process: processConfig,
  benefits: benefitsConfig,
  materials: materialsConfig,
  briefIntro: briefIntroConfig,
  projectBrief: {
    storageKey: 'furniture-project-brief-v1',
    projectTypes: [
      { id: 'kitchen', label: 'Kuhinja', detailLevel: 'extended' },
      { id: 'wardrobe', label: 'Ugradni plakar', detailLevel: 'extended' },
      { id: 'closet', label: 'Ormar / garderober', detailLevel: 'extended' },
      { id: 'tv-wall', label: 'TV zid / komoda', detailLevel: 'basic' },
      { id: 'bathroom', label: 'Kupatilski namještaj', detailLevel: 'basic' },
      { id: 'dining', label: 'Trpezarijski sto', detailLevel: 'basic' },
      { id: 'sofa', label: 'Ugaona garnitura', detailLevel: 'basic' },
      { id: 'armchair', label: 'Fotelja / tabure', detailLevel: 'basic' },
      { id: 'full-interior', label: 'Kompletan enterijer', detailLevel: 'basic' },
      { id: 'other', label: 'Ostalo', detailLevel: 'basic' },
    ],
    budgetRanges: [
      { id: 'under-500', label: 'Do 500 €', maximum: 500 },
      { id: '500-1000', label: '500–1.000 €', maximum: 1000 },
      { id: '1000-1500', label: '1.000–1.500 €', maximum: 1500 },
      { id: '1500-3000', label: '1.500–3.000 €', maximum: 3000 },
      { id: '3000-5000', label: '3.000–5.000 €', maximum: 5000 },
      { id: 'above-5000', label: '5.000 €+', maximum: null },
      { id: 'undecided', label: 'Još nisam definisao budžet', maximum: null },
    ],
    serviceOptions: [
      { id: 'measurement', label: 'Izlazak na teren i precizno mjerenje' },
      { id: 'design', label: 'Prijedlog rasporeda i 3D rješenje' },
      { id: 'demolition', label: 'Demontaža postojećeg namještaja', projects: ['kitchen', 'wardrobe', 'closet', 'tv-wall', 'bathroom'] },
      { id: 'removal', label: 'Odvoz starog namještaja', projects: ['kitchen', 'wardrobe', 'closet', 'tv-wall', 'bathroom'] },
      { id: 'delivery', label: 'Dostava / prevoz' },
      { id: 'installation', label: 'Montaža novog namještaja' },
      { id: 'appliance-installation', label: 'Ugradnja kuhinjskih uređaja', projects: ['kitchen'] },
    ],
    questions: {
      kitchen: ['dimensions', 'appliances', 'island', 'materials', 'installation'],
      wardrobe: ['dimensions', 'doorType', 'storage', 'lighting', 'installation'],
      basic: ['dimensions', 'references', 'materials', 'installation'],
    },
    qualificationRules: {
      // Proposed configuration only; no scoring is run before the wizard exists.
      readinessFields: [
        'location', 'projectType', 'dimensions', 'references',
        'budget', 'timeline', 'services', 'contact',
      ],
      potentialBudgetMismatch: {
        kitchen: { maximumBudget: 500, signals: ['premiumMaterials', 'island'] },
      },
    },
  },
};
