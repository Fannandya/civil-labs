import test from 'node:test';
import assert from 'node:assert/strict';
import { createStructuralMotionFrame, deformPoint, REST_MOTION } from '../src/lib/structuralMotion.ts';

const modes = ['gravity', 'wind', 'seismic', 'soil', 'water'];
const point = (x, y, z, frame) => deformPoint(x, y, z, frame, { x: 0, y: 0, z: 0 });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('disabled response restores the original geometry for every load', () => {
  for (const mode of [...modes, 'structure']) {
    const frame = createStructuralMotionFrame(mode, {}, 5, mode === 'structure');
    assert.deepEqual(frame, REST_MOTION);
    assert.deepEqual(point(-1.65, 3.05, 1.25, frame), { x: -1.65, y: 3.05, z: 1.25 });
  }
});

test('gravity bends the floor down while keeping its four corner supports fixed', () => {
  const frame = createStructuralMotionFrame('gravity', {}, 5);
  assert.ok(point(0, 4.35, 0, frame).y < 4.35);
  for (const x of [-1.65, 1.65]) {
    for (const z of [-1.25, 1.25]) near(point(x, 4.35, z, frame).y, 4.35);
  }
  near(point(0, 4.35, 0, createStructuralMotionFrame('gravity', {}, 0)).y, 4.35);
  near(point(0, 4.35, 0, createStructuralMotionFrame('gravity', {}, 9.5)).y, 4.35);
});

test('wind moves upper levels toward the load and leaves the base restrained', () => {
  const frame = createStructuralMotionFrame('wind', { speed: 35 }, 5);
  near(point(0, .45, 0, frame).x, 0);
  assert.ok(point(0, 4.35, 0, frame).x > point(0, 1.75, 0, frame).x);
  assert.ok(point(0, 1.75, 0, frame).x > 0);
  assert.deepEqual(createStructuralMotionFrame('wind', { speed: 0 }, 5), REST_MOTION);
});

test('seismic motion reverses and uses one base translation through the foundation', () => {
  const roof = [];
  for (let t = 2; t <= 8; t += .25) {
    const frame = createStructuralMotionFrame('seismic', {}, t);
    near(point(0, -4.25, 0, frame).x, frame.baseX);
    near(point(0, .45, 0, frame).x, frame.baseX);
    roof.push(point(0, 4.35, 0, frame).x);
  }
  assert.ok(roof.some(x => x > 0));
  assert.ok(roof.some(x => x < 0));
});

test('soil wall bows inward while its actual upper/lower supports and corners remain fixed', () => {
  const frame = createStructuralMotionFrame('soil', {}, 5);
  assert.ok(point(-1.65, -.956, 0, frame).x > -1.65);
  near(point(-1.65, -2.1, 0, frame).x, -1.65);
  near(point(-1.65, .188, 0, frame).x, -1.65);
  for (const z of [-1.25, 1.25]) near(point(-1.65, -.956, z, frame).x, -1.65);
});

test('water branches are independent and uplift preserves pile attachment points', () => {
  const dry = createStructuralMotionFrame('water', { height: 4, waterDepth: 4, waterHead: 3 }, 5);
  near(dry.wallX, 0);
  assert.ok(dry.upliftY > 0);
  const noUplift = createStructuralMotionFrame('water', { height: 4, waterDepth: 0, waterHead: 0 }, 5);
  near(noUplift.upliftY, 0);
  assert.ok(noUplift.wallX > 0);
  assert.ok(point(0, -2.275, 0, dry).y > -2.275);
  for (const x of [-1.65, 1.65]) {
    for (const z of [-1.25, 1.25]) near(point(x, -2.45, z, dry).y, -2.45);
  }
});

test('finite bounded display responses and repeatable mapping prevent cumulative drift', () => {
  for (const mode of modes) {
    for (const t of [0, .5, 3, 5, 7, 10, 10000, NaN]) {
      const frame = createStructuralMotionFrame(mode, { speed: 1e9, sds: 1e9, waterHead: 1e9 }, t);
      assert.ok(Object.values(frame).every(Number.isFinite));
      const first = point(0, 4.35, 0, frame);
      for (let n = 0; n < 50; n++) assert.deepEqual(point(0, 4.35, 0, frame), first);
      assert.ok(Math.abs(first.x) < .5 && Math.abs(first.y - 4.35) < .2);
    }
  }
});
