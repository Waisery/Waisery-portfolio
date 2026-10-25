import test from 'node:test';
import assert from 'node:assert/strict';
import { createWheelIntent, canScrollWithin } from '../src/presentation.js';

test('a sustained trackpad gesture cannot skip chapters after the transition unlocks', () => {
  const wheel = createWheelIntent();
  assert.equal(wheel(40, 0), 0);
  assert.equal(wheel(40, 30), 1);
  assert.equal(wheel(80, 100, true), 0);
  assert.equal(wheel(80, 280, true), 0);
  assert.equal(wheel(80, 460, true), 0);
  assert.equal(wheel(80, 640, true), 0);
  assert.equal(wheel(80, 820, false), 0);
  assert.equal(wheel(80, 1200, false), 1);
});

test('reversing a small gesture does not inherit movement from its opposite direction', () => {
  const wheel = createWheelIntent();
  assert.equal(wheel(60, 0), 0);
  assert.equal(wheel(-35, 20), 0);
  assert.equal(wheel(-40, 40), -1);
});

test('reading within a chapter consumes the gesture before an edge can trigger navigation', () => {
  const wheel = createWheelIntent();
  assert.equal(wheel(100, 0, true), 0);
  assert.equal(wheel(100, 50, false), 0);
  assert.equal(wheel(100, 350, false), 1);
});

test('nested content can be read until its scroll boundary in either direction', () => {
  const original = globalThis.getComputedStyle;
  globalThis.getComputedStyle = element => ({ overflowY: element.overflow });
  const boundary = { overflow: 'hidden', contains: element => [boundary, panel, text].includes(element), parentElement: null };
  const panel = { overflow: 'auto', scrollHeight: 1000, clientHeight: 500, scrollTop: 0, parentElement: boundary };
  const text = { overflow: 'visible', parentElement: panel };
  try {
    assert.equal(canScrollWithin(text, boundary, 1), true);
    assert.equal(canScrollWithin(text, boundary, -1), false);
    panel.scrollTop = 500;
    assert.equal(canScrollWithin(text, boundary, 1), false);
    assert.equal(canScrollWithin(text, boundary, -1), true);
    assert.equal(canScrollWithin({ parentElement: null }, boundary, 1), false);
  } finally { globalThis.getComputedStyle = original; }
});
