import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beamFlexure } from '../src/lib/engineeringCalculations.ts';
import { MODEL_LEVELS, SEISMIC_FLOOR_HEIGHTS } from '../src/lib/modelLevels.ts';
import { longitudinalBarOffsets } from '../src/components/scene/reinforcementLayout.ts';

test('beam tension bars match every slider value independently of the two constructive top bars', () => {
  for (const axis of [0, 2]) {
    const verticalIndex = axis === 0 ? 0 : 1;
    for (let count = 2; count <= 8; count++) {
      const offsets = longitudinalBarOffsets(axis, count);
      assert.equal(offsets.length, count + 2, `axis ${axis}, tension count ${count}`);
      assert.equal(new Set(offsets.map(([a, b]) => `${a},${b}`)).size, count + 2);
      assert.ok(offsets.slice(0, count).every((offset) => offset[verticalIndex] < 0));
      assert.ok(offsets.slice(count).every((offset) => offset[verticalIndex] > 0));
    }
  }
});

test('beam rendering uses the calculator layout and tension centroid for every supported count', () => {
  for (const axis of [0, 2]) {
    const verticalIndex = axis === 0 ? 0 : 1;
    const horizontalIndex = 1 - verticalIndex;
    for (let count = 2; count <= 8; count++) {
      const params = { bars: count, beamWidth: 300, beamDepth: 600 };
      const beam = beamFlexure(params);
      const offsets = longitudinalBarOffsets(axis, count, params).slice(0, count);
      const positions = offsets.map(offset => [offset[horizontalIndex] * 150, (offset[verticalIndex] + 1) * 300]);
      positions.forEach(([x, y], i) => {
        assert.ok(Math.abs(x - beam.layout.positions[i][0]) < 1e-9);
        assert.ok(Math.abs(y - beam.layout.positions[i][1]) < 1e-9);
      });
      const centroid = positions.reduce((sum, [, y]) => sum + y, 0) / count;
      assert.ok(Math.abs(600 - centroid - beam.d) < 1e-9);
    }
  }
  assert.equal(longitudinalBarOffsets(0, 8, { beamWidth: 120 }).length, 0);
});

test('model labels and numerical seismic heights share the same ordered definition', () => {
  assert.deepEqual(SEISMIC_FLOOR_HEIGHTS, [3.9, 7.8, 11.7, 15.6]);
  assert.deepEqual(MODEL_LEVELS.map(level => level.sceneY), [.45, 1.75, 3.05, 4.35]);
  assert.deepEqual(MODEL_LEVELS.map(level => level.height), SEISMIC_FLOOR_HEIGHTS);
});

test('hidden structural layers are removed rather than left in the raycast tree', async () => {
  const source = await readFile(new URL('../src/components/scene/StructuralModel.tsx', import.meta.url), 'utf8');
  assert.match(source, /layers\.superstructure && <group name="Superstructure_Node"/);
  assert.match(source, /layers\.substructure && <group name="Substructure_Node"/);
  assert.doesNotMatch(source, /visible=\{layers\.(superstructure|substructure)\}/);
});

test('column longitudinal bars match every supported slider value', () => {
  for (let count = 8; count <= 20; count += 2) {
    const offsets = longitudinalBarOffsets(1, count);
    assert.equal(offsets.length, count, `count ${count}`);
    assert.equal(new Set(offsets.map(([a, b]) => `${a},${b}`)).size, count);
    assert.ok(offsets.every(([a, b]) => Math.abs(a) === 1 || Math.abs(b) === 1));
  }
});
