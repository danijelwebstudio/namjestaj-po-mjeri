import test from 'node:test';
import assert from 'node:assert/strict';
import { businessConfig } from '../src/config/businessConfig.js';
import { detailFields, emptyBrief, parseDraft, serviceOptionsForProject, summaryText, validateStep } from '../src/brief/briefLogic.js';
const config = businessConfig.projectBrief;
test('required fields and valid flexible answers', () => {
  assert.equal(Object.keys(validateStep(0, emptyBrief, config)).length, 3);
  assert.deepEqual(validateStep(0, { ...emptyBrief, projectType: 'kitchen', location: 'Bar', propertyType: 'Stan' }, config), {});
  assert.deepEqual(validateStep(1, emptyBrief, config), {});
  assert.equal(Object.keys(validateStep(2, emptyBrief, config)).length, 2);
  assert.deepEqual(validateStep(2, { ...emptyBrief, budget: 'undecided', timeline: 'Fleksibilan rok / još ne znam' }, config), {});
});
test('contact validation accepts email or phone and rejects invalid supplied values', () => {
  assert.ok(validateStep(3, { ...emptyBrief, name: 'Ana' }, config).email);
  assert.ok(validateStep(3, { ...emptyBrief, name: 'Ana', email: 'bad' }, config).email);
  assert.deepEqual(validateStep(3, { ...emptyBrief, name: 'Ana', email: 'ana@example.com' }, config), {});
  assert.deepEqual(validateStep(3, { ...emptyBrief, name: 'Ana', phone: '+382 67 123 456' }, config), {});
  assert.ok(validateStep(3, { ...emptyBrief, name: 'Ana', phone: 'abc' }, config).phone);
});
test('project-specific fields do not leak into summaries for other projects', () => {
  assert.ok(detailFields('closet', config).includes('doorType'));
  const kitchen = { ...emptyBrief, projectType: 'kitchen', appliances: 'Rerna', doorType: 'Klizna' };
  assert.match(summaryText(kitchen, config), /Uređaji: Rerna/);
  assert.doesNotMatch(summaryText(kitchen, config), /Klizna/);
  assert.doesNotMatch(summaryText({ ...kitchen, projectType: 'wardrobe' }, config), /Rerna/);
});
test('versioned drafts sanitize data and reject malformed payloads', () => {
  assert.deepEqual(parseDraft(JSON.stringify({ version: 1, data: emptyBrief })), emptyBrief);
  assert.equal(parseDraft(JSON.stringify({ version: 1, data: { name: 99, extra: 'bad' } })).name, '');
  assert.equal(parseDraft(JSON.stringify({ version: 1, data: { notes: 'x'.repeat(3000) } })).notes.length, 2000);
  assert.throws(() => parseDraft('{broken'));
  assert.throws(() => parseDraft(JSON.stringify({ version: 2, data: emptyBrief })));
});
test('service choices adapt to project and remain readable in summary', () => {
  assert.ok(serviceOptionsForProject('kitchen', config).some((item) => item.id === 'appliance-installation'));
  assert.ok(!serviceOptionsForProject('sofa', config).some((item) => item.id === 'demolition'));
  const text = summaryText({ ...emptyBrief, projectType: 'kitchen', services: ['delivery', 'installation'], servicesOther: 'Unos na treći sprat' }, config);
  assert.match(text, /Dostava \/ prevoz/);
  assert.match(text, /Montaža novog namještaja/);
  assert.match(text, /Drugo: Unos na treći sprat/);
});
