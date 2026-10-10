import test from 'node:test';
import assert from 'node:assert/strict';
import { beamFlexure, columnAxial, shearWall, slabMinimumThickness, basementPressure, pileReactions, floorLoads, windVelocityPressure, seismicBaseShear, soilAtRestForce, distributeSeismicForces, upliftStability, calculateEngineering } from '../src/lib/engineeringCalculations.ts';
import { structuralElements } from '../data/structuralElements.ts';

const near = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

test('beam: SI conversions, effective depth, beta1, strain and strength', () => {
  const b = beamFlexure({});
  near(b.As, 1520.53084433746); near(b.d, 539); near(b.beta1, .835714285714286);
  near(b.nominal, 317.561610569, .00001); near(b.capacity, 285.805449512, .00001);
  near(b.phi, .9); assert.equal(b.valid, true);
  near(beamFlexure({fc: 20}).beta1, .85); near(beamFlexure({fc: 70}).beta1, .65);
  const transition = beamFlexure({bars: 9});
  assert.ok(transition.strain >= .004 && transition.strain < .005);
  assert.ok(transition.phi > .65 && transition.phi < .9);
  assert.equal(beamFlexure({bars: 15}).valid, false);
  assert.equal(calculateEngineering('beam_moment', {bars: 15}).dcr, null);
  assert.equal(beamFlexure({bars: 1}).valid, false);
});

test('beam packing adds layers and uses centroid depth while strain uses extreme tension steel', () => {
  const five = beamFlexure({ bars: 5 });
  assert.equal(five.layout.rows, 2);
  near(five.d, 600 - (3 * 61 + 2 * 108) / 5);
  near(five.dt, 539);
  near(five.strain, .003 * (five.dt - five.c) / five.c);
  const eight = beamFlexure({ bars: 8 });
  assert.equal(eight.layout.rows, 2);
  near(eight.d, 515.5);
  for (const [x, y] of eight.layout.positions) {
    assert.ok(Math.abs(x) <= 89);
    assert.ok(y >= 61);
  }
  const rows = Map.groupBy(eight.layout.positions, ([, y]) => y);
  for (const positions of rows.values()) {
    for (let i = 1; i < positions.length; i++) assert.ok(positions[i][0] - positions[i - 1][0] - 22 >= 25);
  }
  assert.equal(beamFlexure({ bars: 8, beamWidth: 120 }).valid, false);
  assert.equal(calculateEngineering('beam_moment', { bars: 8, beamWidth: 120 }).dcr, null);
  assert.equal(beamFlexure({ bars: 8, beamDepth: 160 }).valid, false);
  assert.throws(() => beamFlexure({ bars: 3.5 }), /bilangan bulat/);
});

test('column: axial upper bound with tied-column .80 and .65 factors', () => {
  const c = columnAxial({});
  near(c.P0, 13008.762249494, .00001); near(c.capacity, 6764.556369737, .00001);
  near(c.rho, .0163624617374468); assert.equal(c.valid, true);
  near(calculateEngineering('column_axial', {columnPu: 4850}).dcr, .717, .0001);
  assert.equal(columnAxial({columnRebarCount: 4}).valid, false);
});

test('special wall: aspect-dependent alpha, steel ratio and shear cap', () => {
  const w = shearWall({});
  near(w.alpha, .17); near(w.rho, .00589921287174083);
  near(w.capacity, 2508.050137866, .00001); near(w.phi, .6);
  near(shearWall({wallHeight: 6}).alpha, .25);
  near(shearWall({wallHeight: 7}).alpha, .21);
  const dense = shearWall({spacing: 20});
  near(dense.nominal, .83 * 1200000 * Math.sqrt(35) / 1000);
  assert.equal(shearWall({spacing: 500}).valid, false);
});

test('slab: both empirical thickness branches and applicability limits', () => {
  near(slabMinimumThickness({ratio: 5.7/3.7}).minimum, 125.739837398374);
  near(slabMinimumThickness({alphaFm: 1, ratio: 1.5}).minimum, 5700*1.1/42);
  near(slabMinimumThickness({span: 1, alphaFm: 1}).minimum, 125);
  near(slabMinimumThickness({span: 1, alphaFm: 2.1}).minimum, 90);
  assert.equal(slabMinimumThickness({alphaFm: .2}).minimum, null);
  assert.equal(slabMinimumThickness({ratio: 2.1}).minimum, null);
  assert.equal(calculateEngineering('slab_thickness', {alphaFm: .1}).dcr, null);
  assert.ok(calculateEngineering('slab_thickness', {slabThickness: 110}).dcr > 1);
});

test('basement: effective earth stress plus water, water table below base and at grade', () => {
  const p = basementPressure({}); near(p.k0, .5); near(p.soil, 33.19); near(p.water, 19.62); near(p.total, 52.81);
  near(basementPressure({waterDepth: 6}).total, 41);
  near(basementPressure({waterDepth: 0}).total, 64.62);
  assert.throws(() => basementPressure({waterDepth: -1}), RangeError);
});

test('pile: rigid cap service reactions conserve axial load and moment', () => {
  const p = pileReactions({}); near(p.maximum, 1066.66666666667); near(p.minimum, 933.333333333333);
  near(2*p.maximum + 2*p.minimum, 4000);
  near(2*(p.maximum-p.minimum)*.75, 200);
  near(pileReactions({momentM:-200}).maximum, p.maximum);
  assert.equal(calculateEngineering('pile_capacity', {pileServiceLoad: 100, momentM: 1000}).dcr, null);
  near(calculateEngineering('pile_capacity', {}).dcr, 8/9);
});

test('floor: mass to force, minimum live load is not occupancy capacity', () => {
  const f = floorLoads({occupantCount: 300});
  near(f.totalMass, 21000); near(f.occupantForce, 206.01); near(f.occupantLoad, 1.07296875);
  near(f.liveScenario, 2.07296875); near(f.liveDesign, 2.4); near(f.dead, 4.86); near(f.factored, 9.672);
  assert.ok(floorLoads({occupantCount: 600}).liveDesign > 2.4);
  const d = floorLoads({occupantCount: 0, partitionFurniture: 0, minimumLiveLoad: 0, deadLoadSidl: 50});
  near(d.factored, 1.4*d.dead);
  assert.equal(calculateEngineering('gravity_reduction', {}).dcr, null);
});

test('calculator validates floor loads only when the selected calculation uses them', () => {
  const unrelatedFloorInput = {personWeight: 0};
  const uplift = calculateEngineering('water_uplift', unrelatedFloorInput);
  assert.equal(uplift.status, 'Memenuhi pemeriksaan yang ditampilkan');
  assert.notEqual(uplift.value, '—');

  for (const type of ['beam_moment', 'gravity_reduction']) {
    const result = calculateEngineering(type, unrelatedFloorInput);
    assert.equal(result.status, 'Masukan tidak valid', type);
    assert.equal(result.value, '—', type);
  }
});

test('wind: Pa units and quadratic speed law', () => {
  near(windVelocityPressure({}), 542.5433125);
  near(windVelocityPressure({speed:70}), 4*windVelocityPressure({}));
  near(windVelocityPressure({speed:0}), 0);
  near(windVelocityPressure({ke: .9}), .9*windVelocityPressure({}));
});

test('ELF: period upper limit, long period branch, S1 minimum, exponent and conservation', () => {
  const s = seismicBaseShear({sds: .708}); near(s.cs, .0885); near(s.shear, 1062); near(s.exponent, 1.05);
  const upper = seismicBaseShear({period: 2}); near(upper.cs, .507/16);
  const long = seismicBaseShear({period: 8, sds:.1, sd1:1}); near(long.upper, 6/512); near(long.cs, 6/512);
  near(seismicBaseShear({s1:.8, period:4}).cs, .05);
  near(seismicBaseShear({period:.5}).exponent, 1); near(seismicBaseShear({period:2.5}).exponent, 2);
  const forces = distributeSeismicForces([3000,3000,3000,3000], [3.9,7.8,11.7,15.6], 1062, 1.05);
  near(forces.reduce((a,b)=>a+b,0), 1062);
  assert.ok(forces.every((value, index)=>index===0 || value>forces[index-1]));
  assert.throws(()=>distributeSeismicForces([1], [1,2], 100, 1), RangeError);
});

test('earth: restrained K0 versus active Ka and resultant height', () => {
  const s = soilAtRestForce({}); near(s.k0,.5); near(s.ka,1/3); near(s.force,72); near(s.activeForce,48); near(s.applicationHeight,4/3);
});

test('uplift: SNI8460 example, conservative target and zero head', () => {
  const u = upliftStability({}); near(u.uplift,8829); near(u.sf,13500/8829); near(u.ratio,.981);
  near(upliftStability({targetSF:2}).ratio,2*8829/13500);
  assert.throws(()=>upliftStability({targetSF:1.25}), RangeError);
  const dry=upliftStability({waterHead:0}); near(dry.ratio,0); assert.equal(dry.sf,Infinity);
});

test('all eleven configured calculators produce finite results; demand-only results have no DCR', () => {
  assert.equal(structuralElements.length,11);
  const demandOnly = new Set(['retaining_wall','gravity_reduction','wind_pressure','seismic_shear','earth_force']);
  for (const item of structuralElements) {
    const config=item.calculator;
    assert.ok(config, item.id);
    const params=Object.fromEntries(config.params.map(p=>[p.key,p.defaultValue]));
    const result=calculateEngineering(config.type,params);
    assert.ok(result && result.value!=='—',item.id);
    assert.ok(Number.isFinite(Number(result.value)),`${item.id}: ${result.value}`);
    if (demandOnly.has(config.type)) {
      assert.equal(result.dcr,null,item.id);
      assert.equal(item.workedExample.safetyCheck.status,'BELUM DIEVALUASI');
    } else assert.ok(Number.isFinite(result.dcr),item.id);
    assert.ok(result.notes.length>30);
  }
});

test('invalid inputs return no numerical or safety claim', () => {
  for (const [type,params] of [['wind_pressure',{speed:NaN}], ['beam_moment',{beamDepth:0}], ['seismic_shear',{responseR:0}], ['water_uplift',{deadWeight:0}], ['earth_force',{phi:90}]]) {
    const result=calculateEngineering(type,params);
    assert.equal(result.dcr,null); assert.equal(result.value,'—'); assert.equal(result.status,'Masukan tidak valid');
  }
  assert.equal(calculateEngineering('unrecognized',{}),null);
});

test('column and uplift configured controls change their own result', () => {
  const column = structuralElements.find(e => e.id==='elem-kolom').calculator;
  assert.ok(column.params.some(p => p.key==='columnRebarCount'));
  const defaults=Object.fromEntries(column.params.map(p=>[p.key,p.defaultValue]));
  assert.notEqual(calculateEngineering(column.type,{...defaults,columnRebarCount:8}).value, calculateEngineering(column.type,{...defaults,columnRebarCount:16}).value);
  assert.ok(calculateEngineering('water_uplift',{targetSF:2.5}).dcr>1);
});

test('column factored load and pile service load remain independent', () => {
  const params={columnPu:10000,pileServiceLoad:4000};
  near(calculateEngineering('column_axial',params).dcr,10000/columnAxial({}).capacity);
  near(calculateEngineering('pile_capacity',params).dcr,8/9);
  near(calculateEngineering('pile_capacity',{...params,columnPu:2000}).dcr,8/9);
  near(calculateEngineering('column_axial',{...params,pileServiceLoad:1000}).dcr,10000/columnAxial({}).capacity);
});
