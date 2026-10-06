/** Deterministic score of *brief readiness*, not buyer quality or estimated price. */
export function calculateLeadQualification(data = {}, files = [], config) {
  const rules = config.qualificationRules;
  const weights = rules.weights;
  const clean = (value) => typeof value === 'string' ? value.trim() : '';
  const attachments = Array.isArray(files) ? files : [];
  const services = Array.isArray(data.services) ? data.services : [];
  const has = (key) => !!clean(data[key]);
  const photoCount = attachments.filter((item) => item.kind === 'photo').length;
  const planCount = attachments.filter((item) => item.kind === 'plan').length;
  const positives = [];
  const missing = [];
  let score = 0;
  function criterion(key, awarded, positive, absent) {
    const points = Math.max(0, Math.min(weights[key], awarded));
    score += points;
    if (points === weights[key]) positives.push(positive);
    else if (absent) missing.push(absent);
  }
  criterion('projectType', config.projectTypes.some((p) => p.id === data.projectType) ? weights.projectType : 0, 'Vrsta projekta definisana', 'Odrediti vrstu projekta');
  criterion('location', has('location') ? weights.location : 0, 'Lokacija navedena', 'Navesti grad ili mjesto');
  criterion('propertyType', config.propertyTypes.includes(data.propertyType) ? weights.propertyType : 0, 'Vrsta objekta definisana', 'Navesti vrstu objekta');
  criterion('dimensions', has('dimensions') ? weights.dimensions : 0, 'Okvirne mjere navedene', 'Dopuniti okvirne mjere prostora');
  criterion('references', has('references') ? weights.references : 0, 'Opis ideje / reference navedene', 'Dodati opis ideje ili referencu');
  criterion('photos', photoCount ? weights.photos : 0, 'Fotografije prostora priložene', 'Dodati fotografije prostora kada budu dostupne');
  criterion('plan', planCount ? weights.plan : 0, 'Nacrt ili projekat priložen', 'Nacrt može pomoći, ali nije obavezan');
  const budget = config.budgetRanges.find((r) => r.id === data.budget);
  criterion('budget', budget ? (budget.id === 'undecided' ? 3 : weights.budget) : 0, 'Okvirni budžet definisan', 'Precizirati okvirni budžet');
  const timeline = clean(data.timeline);
  criterion('timeline', config.timelines.includes(timeline) ? (/Fleksibilan|još ne znam/i.test(timeline) ? 3 : weights.timeline) : 0, 'Željeni rok definisan', 'Precizirati rok ili dogovoriti fleksibilan termin');
  const stage = data.projectStage;
  criterion('projectStage', stage === 'ready' ? weights.projectStage : stage === 'planning' ? 4 : stage === 'research' ? 2 : 0, 'Projekat spreman za naredni korak', 'Razjasniti fazu projekta');
  const doc = data.documentation;
  criterion('documentation', ['plan', '3d'].includes(doc) ? 4 : ['sketch', 'photos'].includes(doc) ? 3 : doc === 'idea' ? 2 : 0, 'Dokumentacija navedena', 'Navesti dostupnu dokumentaciju');
  criterion('services', services.length ? weights.services : (has('servicesOther') || has('servicesUnsure')) ? 3 : 0, 'Potrebne usluge odabrane', 'Razjasniti potrebne usluge');
  criterion('contact', has('name') && (has('email') || has('phone')) ? weights.contact : 0, 'Kontakt podaci ostavljeni', 'Dopuniti ime i način kontakta');
  criterion('access', has('access') ? weights.access : (has('floor') || has('elevator')) ? 2 : 0, 'Pristup prostoru opisan', 'Razjasniti prilaz, sprat ili dostavu');

  const includesAny = (value, words) => words.some((word) => clean(value).toLocaleLowerCase('sr').includes(word));
  const island = /^(da|želim|zelim|planiram|obavezno|potrebno)/i.test(clean(data.island));
  const signals = {
    island,
    premiumMaterials: includesAny(data.materials, rules.premiumMaterialWords),
    premiumAppliances: includesAny(data.appliances, rules.premiumApplianceWords),
    multipleRooms: /više prostorija|vise prostorija|cijeli stan|cela kuća|cijela kuća|kompletan stan/i.test(clean(data.references) + ' ' + clean(data.notes)),
    designAndInstallation: services.includes('design') && services.includes('installation'),
  };
  const mismatch = rules.budgetWarnings.some((rule) => rule.projectTypes.includes(data.projectType)
    && rule.budgetIds.includes(data.budget)
    && rule.signals.filter((name) => signals[name]).length >= rule.minSignals);
  const warnings = mismatch ? ['Moguće neslaganje budžeta i zahtjeva — provjeriti sa klijentom prije izlaska na teren.'] : [];
  const rounded = Math.round(score);
  const level = rules.levels.find((item) => rounded >= item.min) || rules.levels.at(-1);
  return { score: Math.min(100, Math.max(0, rounded)), level: level.level, label: level.label, missing, positives, warnings };
}
