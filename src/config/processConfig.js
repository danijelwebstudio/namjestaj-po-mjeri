// Demo workflow. Adapt the terms of measuring, design and delivery to the actual business.
export const processConfig = {
  id: 'kako-radimo',
  eyebrow: 'KAKO RADIMO',
  title: 'Od prve ideje do posljednjeg detalja.',
  description: 'Dobar rezultat počinje jasnim dogovorom. Zajedno prolazimo kroz prostor, potrebe i mogućnosti, korak po korak.',
  preparation: {
    title: 'Ne morate imati gotov nacrt.',
    description: 'Za početak je dovoljno da znamo šta želite, gdje se prostor nalazi i šta već imate od mjera ili inspiracije.',
  },
  stepsLabel: 'Koraci saradnje',
  steps: [
    {
      id: 'idea',
      title: 'Vaša ideja i prvi razgovor',
      description: 'Podijelite želje, fotografije prostora i okvirne mjere ako ih imate. Razgovaramo o prioritetima, planiranom budžetu i roku da bismo razumjeli kakvo rješenje ima smisla.',
    },
    {
      id: 'planning',
      title: 'Mjerenje i razrada rješenja',
      description: 'Provjeravamo dimenzije, položaj instalacija i mogućnosti prostora. Razrađujemo raspored i detalje. Uslove mjerenja i projektovanja dogovaramo unaprijed.',
    },
    {
      id: 'agreement',
      title: 'Dogovor i konačna ponuda',
      description: 'Usaglašavamo materijale, okove, završnu obradu i obim posla. Na osnovu potvrđenih mjera i rješenja definišemo cijenu, rok i uslove realizacije.',
    },
    {
      id: 'making',
      title: 'Izrada i montaža',
      description: 'Nakon prihvaćene ponude slijedi izrada prema dogovorenom rješenju. Dostavu i montažu planiramo u dogovorenom obimu, uz završnu provjeru detalja i funkcionalnosti.',
    },
  ],
  quoteNote: {
    eyebrow: 'PRIJE KONAČNE PONUDE',
    title: 'Za cijenu su važni detalji.',
    description: 'Fotografija nam pomaže da razumijemo stil koji želite. Dimenzije, materijali, okovi i obim radova određuju cijenu. Prvi upit priprema razgovor, a konačnu ponudu dajemo nakon provjere mjera i dogovora o rješenju.',
  },
};
