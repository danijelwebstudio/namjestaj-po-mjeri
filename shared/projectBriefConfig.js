// Shared pure-data brief options: consumed by both the web UI and Edge Function.
export const projectBriefConfig = {
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
    projectStages: [
      { id: 'research', label: 'Samo istražujem mogućnosti' },
      { id: 'planning', label: 'Planiram realizaciju' },
      { id: 'ready', label: 'Spreman sam krenuti ako ponuda odgovara' },
    ],
    documentationOptions: [
      { id: 'idea', label: 'Nemam ništa, imam samo ideju' },
      { id: 'photos', label: 'Imam fotografije prostora' },
      { id: 'sketch', label: 'Imam okvirnu skicu' },
      { id: 'plan', label: 'Imam gotov nacrt / projekat' },
      { id: '3d', label: 'Imam 3D / projekat dizajnera' },
    ],
    designerOptions: [
      { id: 'yes', label: 'Da' },
      { id: 'no', label: 'Ne' },
      { id: 'undecided', label: 'Još nisam odlučio' },
    ],
    propertyTypes: ['Kuća', 'Stan', 'Poslovni prostor', 'Drugo'],
    timelines: ['U naredna 1–3 mjeseca', 'U naredna 3–6 mjeseci', 'Kasnije', 'Fleksibilan rok / još ne znam'],
    questions: {
      kitchen: ['dimensions', 'appliances', 'island', 'materials', 'installation'],
      wardrobe: ['dimensions', 'doorType', 'storage', 'lighting', 'installation'],
      basic: ['dimensions', 'references', 'materials', 'installation'],
    },
    // Every readiness criterion is auditable. Weights sum to 100.
    qualificationRules: {
      weights: {
        projectType: 8, location: 8, propertyType: 5, dimensions: 12,
        references: 8, photos: 10, plan: 5, budget: 10,
        timeline: 7, projectStage: 6, documentation: 4, services: 6,
        contact: 7, access: 4,
      },
      levels: [
        { min: 80, level: 'ready', label: 'Spreman za razgovor' },
        { min: 55, level: 'good', label: 'Potrebna manja dopuna' },
        { min: 30, level: 'early', label: 'Rani upit' },
        { min: 0, level: 'limited', label: 'Nedovoljno informacija' },
      ],
      // Heuristics only: this is NOT an estimator of furniture price.
      budgetWarnings: [
        { projectTypes: ['kitchen'], budgetIds: ['under-500'], minSignals: 2, signals: ['island', 'premiumMaterials', 'premiumAppliances'] },
        { projectTypes: ['kitchen'], budgetIds: ['500-1000'], minSignals: 3, signals: ['island', 'premiumMaterials', 'premiumAppliances'] },
        { projectTypes: ['full-interior'], budgetIds: ['under-500', '500-1000'], minSignals: 2, signals: ['premiumMaterials', 'multipleRooms', 'designAndInstallation'] },
      ],
      premiumMaterialWords: ['masiv', 'mermer', 'kvarc', 'granit', 'prirodni kamen', 'punog drveta'],
      premiumApplianceWords: ['premium', 'miele', 'gaggenau', 'sub-zero'],
    },

  };
