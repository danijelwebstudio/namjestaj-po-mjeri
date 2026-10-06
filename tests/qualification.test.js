import test from 'node:test';
import assert from 'node:assert/strict';
import { projectBriefConfig as config } from '../shared/projectBriefConfig.js';
import { emptyBrief, summaryRows, summaryText, validateStep, parseDraft } from '../shared/briefLogic.js';
import { calculateLeadQualification } from '../src/brief/qualification.js';
import { validatePayload } from '../supabase/functions/_shared/validate.js';
const full = {
  ...emptyBrief, projectType: 'kitchen', location: 'Novi Sad', propertyType: 'Stan',
  dimensions: '240 x 210 cm', references: 'Svijetla kuhinja', materials: 'Medijapan',
  budget: '3000-5000', timeline: 'U naredna 1–3 mjeseca',
  projectStage: 'ready', documentation: 'sketch', designerStatus: 'no',
  services: ['measurement', 'installation'], name: 'Ana', phone: '060123456', access: 'Parking kod ulaza',
};
const photo = [{ kind: 'photo', name: 'space.jpg', size: 1000 }];
const plan = { kind: 'plan', name: 'nacrt.pdf', size: 1000 };
const calculate = (data = full, files = photo) => calculateLeadQualification(data, files, config);
test('weights are auditable, score is deterministic and within 0–100', () => {
  assert.equal(Object.values(config.qualificationRules.weights).reduce((a, b) => a + b, 0), 100);
  const result = calculate();
  assert.deepEqual(result, calculate());
  assert.ok(result.score >= 80 && result.score <= 100);
  assert.equal(result.label, 'Spreman za razgovor');
  assert.ok(result.positives.some((text) => /Fotografije/.test(text)));
  assert.ok(result.missing.some((text) => /Nacrt/.test(text)));
  assert.equal(result.warnings.length, 0);
});
test('plans and photos change completeness but no drawing is required', () => {
  assert.equal(calculate(full, [...photo, plan]).score - calculate().score, 5);
  assert.equal(calculate(full, []).score, calculate().score - 10);
  assert.deepEqual(validateStep(1, { ...full, documentation: 'idea' }, config), {});
});
test('readiness levels are descriptive, missing fields explicit', () => {
  const empty = calculate(emptyBrief, []);
  assert.equal(empty.score, 0);
  assert.equal(empty.level, 'limited');
  assert.ok(empty.missing.some((item) => /budžet/i.test(item)));
  const early = calculate({ ...emptyBrief, projectType: 'kitchen', location: 'Novi Sad', propertyType: 'Stan', name: 'Test', email: 'test@example.com', projectStage: 'research' }, []);
  assert.equal(early.level, 'early');
  const good = calculate({ ...full, references: '', dimensions: '', access: '', services: [] });
  assert.equal(good.level, 'good');
});
test('budget warnings only for configured obvious combinations', () => {
  const low = { ...full, budget: 'under-500', island: 'Da', materials: 'Radna ploča od kvarca' };
  assert.equal(calculate(low).warnings.length, 1);
  assert.equal(calculate({ ...low, island: 'Ne' }).warnings.length, 0);
  assert.equal(calculate({ ...low, budget: '3000-5000' }).warnings.length, 0);
  assert.equal(calculate({ ...low, projectType: 'wardrobe' }).warnings.length, 0);
  assert.equal(calculate({ ...low, island: 'Još razmatram' }).warnings.length, 0);
});
test('new project metadata is saved in draft, summarized and validated on server', () => {
  const record = parseDraft(JSON.stringify({ version: 1, data: full }));
  assert.equal(record.projectStage, 'ready');
  assert.equal(record.documentation, 'sketch');
  assert.equal(record.designerStatus, 'no');
  const rows = Object.fromEntries(summaryRows(record, config));
  assert.equal(rows['Faza projekta'], 'Spreman sam krenuti ako ponuda odgovara');
  assert.equal(rows['Dostupna dokumentacija'], 'Imam okvirnu skicu');
  assert.equal(rows['Saradnja sa arhitektom / dizajnerom'], 'Ne');
  assert.match(summaryText(record, config), /Imam okvirnu skicu/);
  const valid = { id: '12345678-1234-4234-8234-123456789abc', consent: true, data: record };
  assert.equal(validatePayload(valid, []).designerStatus, 'no');
  for (const key of ['projectStage', 'documentation', 'designerStatus']) {
    assert.throws(() => validatePayload({ ...valid, data: { ...record, [key]: 'fake-value' } }, []), /Neispravan/);
  }
  assert.equal(validatePayload({ ...valid, data: { ...record, projectStage: '', documentation: '', designerStatus: '' } }, []).projectStage, '');
});
test('older stored leads with missing metadata can still render summaries', () => {
  const rows = summaryRows({ projectType: 'kitchen', location: 'Bar' }, config);
  assert.ok(rows.some(([key, value]) => key === 'Faza projekta' && value === 'Nije navedeno'));
});
