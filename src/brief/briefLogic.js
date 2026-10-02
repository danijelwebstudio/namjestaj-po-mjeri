export const DRAFT_VERSION = 1;
export const stepLabels = ['Projekat', 'Detalji', 'Plan', 'Kontakt', 'Pregled'];
export const emptyBrief = {
  projectType: '', location: '', dimensions: '', references: '', materials: '',
  appliances: '', island: '', doorType: '', storage: '', lighting: '',
  budget: '', timeline: '', services: [], servicesOther: '', name: '', email: '', phone: '', notes: '',
  propertyType: '', floor: '', elevator: '', access: '', address: '', servicesUnsure: '',
};

export function detailFields(type, config) {
  if (type === 'kitchen') return config.questions.kitchen;
  if (type === 'wardrobe' || type === 'closet') return config.questions.wardrobe;
  return config.questions.basic;
}

export function serviceOptionsForProject(type, config) {
  return config.serviceOptions.filter((item) => !item.projects || item.projects.includes(type));
}

export function validateStep(step, data, config) {
  const errors = {};
  if (step === 0) {
    if (!config.projectTypes.some((item) => item.id === data.projectType)) errors.projectType = 'Izaberite vrstu projekta.';
    if (!data.location.trim()) errors.location = 'Unesite grad ili mjesto projekta.';
    if (!['Kuća', 'Stan', 'Poslovni prostor', 'Drugo'].includes(data.propertyType)) errors.propertyType = 'Izaberite vrstu objekta.';
  }
  if (step === 2) {
    if (!config.budgetRanges.some((item) => item.id === data.budget)) errors.budget = 'Izaberite okvirni budžet ili opciju da još nije definisan.';
    if (!data.timeline.trim()) errors.timeline = 'Izaberite željeni rok ili opciju da ste fleksibilni.';
  }
  if (step === 3) {
    if (!data.name.trim()) errors.name = 'Unesite svoje ime.';
    if (!data.email.trim() && !data.phone.trim()) errors.email = 'Unesite email ili telefon za kontakt.';
    else if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Provjerite email adresu.';
    if (data.phone.trim() && (!/^\+?[\d\s()./-]{6,30}$/.test(data.phone.trim()) || data.phone.replace(/\D/g, '').length < 6)) errors.phone = 'Provjerite broj telefona (najmanje 6 cifara).';
  }
  return errors;
}

export function summaryRows(data, config) {
  const fields = detailFields(data.projectType, config);
  const rows = [
    ['Projekat', config.projectTypes.find((item) => item.id === data.projectType)?.label],
    ['Lokacija', data.location], ['Mjere / dimenzije', data.dimensions],
    ['Objekat', data.propertyType], ['Sprat / etaža', data.floor], ['Lift', data.elevator], ['Pristup za dostavu', data.access], ['Adresa (opcionalno)', data.address],
    ['Materijali', data.materials], ['Inspiracija / reference', data.references],
  ];
  const extra = { appliances: 'Uređaji', island: 'Kuhinjsko ostrvo', doorType: 'Vrsta vrata', storage: 'Organizacija prostora', lighting: 'Rasvjeta' };
  for (const [key, label] of Object.entries(extra)) if (fields.includes(key)) rows.push([label, data[key]]);
  const serviceLabels = serviceOptionsForProject(data.projectType, config)
    .filter((item) => data.services.includes(item.id)).map((item) => item.label);
  if (data.servicesOther.trim()) serviceLabels.push(`Drugo: ${data.servicesOther.trim()}`);
  if (data.servicesUnsure) serviceLabels.push('Potreban je dogovor / preporuka za izbor usluga.');
  rows.push(['Budžet', config.budgetRanges.find((item) => item.id === data.budget)?.label],
    ['Željeni rok', data.timeline], ['Potrebne usluge', serviceLabels.join('\n')],
    ['Ime', data.name], ['Email', data.email], ['Telefon', data.phone], ['Napomena', data.notes]);
  return rows.map(([label, value]) => [label, value?.trim() || 'Nije navedeno']);
}

export function summaryText(data, config) {
  return 'UPIT ZA NAMJEŠTAJ PO MJERI\n\n' + summaryRows(data, config).map(([label, value]) => `${label}: ${value}`).join('\n\n')
    + '\n\nUpit nije poslat. Konačna ponuda zahtijeva potvrđene mjere i dogovoreno rješenje.';
}

export function parseDraft(raw) {
  const parsed = JSON.parse(raw);
  if (parsed?.version !== DRAFT_VERSION || !parsed.data || typeof parsed.data !== 'object') throw new Error('Nepoznat format nacrta');
  const draft = Object.fromEntries(Object.keys(emptyBrief).map((key) => [key,
    Array.isArray(emptyBrief[key])
      ? (Array.isArray(parsed.data[key]) ? parsed.data[key].filter((value) => typeof value === 'string').slice(0, 20) : [])
      : (typeof parsed.data[key] === 'string' ? parsed.data[key].slice(0, 2000) : ''),
  ]));
  if (typeof parsed.data.services === 'string' && !draft.servicesOther) draft.servicesOther = parsed.data.services.slice(0, 2000);
  return draft;
}
