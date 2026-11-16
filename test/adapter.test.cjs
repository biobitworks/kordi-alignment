'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const register = require('../extensions/alignment-compass.cjs');

function install() {
  const tools = [];
  const commands = [];
  const kordi = {
    registerTool: definition => tools.push(definition),
    registerCommand: (name, definition) => commands.push({ name, definition }),
  };
  register(kordi);
  return { tools, commands };
}

test('plugin registers exactly one Kordi tool and one slash command', () => {
  const { tools, commands } = install();
  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, 'alignment_compass');
  assert.equal(commands.length, 1);
  assert.equal(commands[0].name, 'alignment');
  assert.equal(typeof tools[0].execute, 'function');
  assert.equal(typeof commands[0].definition.handler, 'function');
});

test('Kordi tool schema supports missing evidence or scores for UNKNOWN', async () => {
  const { tools } = install();
  const schema = tools[0].parameters;
  assert.deepEqual(schema.required, ['scope', 'items']);
  assert.deepEqual(schema.properties.items.items.required, ['id']);
  const result = await tools[0].execute('fixture-1', {
    scope: 'agent_decision', items: [{ id: 'missing-axis' }],
  });
  const body = JSON.parse(result.content[0].text);
  assert.equal(body.results[0].status, 'UNKNOWN');
  assert.equal(body.results[0].alignment, null);
});

test('tool and slash command classify the same explicit synthetic input', async () => {
  const { tools, commands } = install();
  const input = {
    scope: 'fictional', items: [{
      id: 'scenario-1', lawChaos: -2, goodEvil: 2,
      evidence: ['A fictional hero improvises to protect a group.'],
    }],
  };
  const toolResult = await tools[0].execute('fixture-2', input);
  const commandResult = await commands[0].definition.handler(JSON.stringify(input));
  const a = JSON.parse(toolResult.content[0].text);
  const b = JSON.parse(commandResult.message);
  assert.deepEqual(a, b);
  assert.equal(a.results[0].alignment, 'Chaotic Good');
});

test('invalid scope or parse failures cannot grant extra tool privileges', async () => {
  const { tools, commands } = install();
  const response = await tools[0].execute('fixture-3', {
    scope: 'human', items: [{ id: 'real-person' }],
  });
  assert.equal(response.is_error, true);
  const malformed = await commands[0].definition.handler('{not-json}');
  assert.match(malformed.message, /input error/i);
  const help = await commands[0].definition.handler('help');
  assert.match(help.message, /cannot override Kordi safeguards/i);
});

test('package manifest exposes extension, skill and prompt discovery roots', () => {
  const manifest = require('../package.json');
  assert.equal(manifest.name, '@biobitworks/kordi-alignment');
  assert.deepEqual(manifest.kordi, {
    extensions: ['./extensions'],
    skills: ['./skills'],
    prompts: ['./prompts'],
  });
});
