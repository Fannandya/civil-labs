import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { useViewerStore } from '../src/store/viewer.ts';
import { sceneDimensions } from '../src/components/scene/sceneConfig.ts';
import { LOAD_JOURNEYS } from '../src/lib/loadJourney.ts';
import { floorLoads, windVelocityPressure } from '../src/lib/engineeringCalculations.ts';
const reset = () => useViewerStore.setState(useViewerStore.getInitialState(), true);

test('each load selection opens its own visualization and clears a prior ratio', () => {
  for (const [id, mode] of [['load-gravitasi','gravity'],['load-angin','wind'],['load-gempa','seismic'],['load-tekanan-tanah','soil'],['load-tekanan-air','water']]) {
    reset(); useViewerStore.getState().setActiveDcr(.9);
    useViewerStore.getState().select(id);
    assert.equal(useViewerStore.getState().visualizationMode, mode);
    assert.equal(useViewerStore.getState().activeDcr, null);
  }
});
test('mouse and touch selections leave exhibition so the material drawer remains accessible', () => {
  reset(); useViewerStore.getState().setExhibitionMode(true);
  useViewerStore.getState().select('elem-balok');
  assert.equal(useViewerStore.getState().exhibitionMode, false);
  useViewerStore.getState().setExhibitionMode(true);
  useViewerStore.getState().touch('load-tekanan-air', [0,-2,0]);
  assert.equal(useViewerStore.getState().activeId, null);
  useViewerStore.getState().touch('load-tekanan-air', [0,-2,0]);
  assert.equal(useViewerStore.getState().activeId, 'load-tekanan-air');
  assert.equal(useViewerStore.getState().visualizationMode, 'water');
  assert.equal(useViewerStore.getState().exhibitionMode, false);
});
test('changing context reveals the teaching model without mutating calculation inputs', () => {
  reset(); const original = {...useViewerStore.getState().playgroundParams};
  useViewerStore.getState().toggleLayer('superstructure');
  useViewerStore.getState().toggleLayer('load_vector');
  useViewerStore.getState().select('elem-kolom');
  useViewerStore.getState().setVisualizationMode('wind');
  assert.equal(useViewerStore.getState().activeId, null);
  assert.deepEqual(useViewerStore.getState().layers, {superstructure:true,substructure:true,load_vector:true});
  assert.deepEqual(useViewerStore.getState().playgroundParams, original);
});
test('member cross sections use one scale and respond to playground dimensions', () => {
  const dimensions = sceneDimensions({},false);
  assert.equal(dimensions.beamDepth / dimensions.beamWidth,2);
  assert.equal(dimensions.column / dimensions.beamWidth,2);
  const changed = sceneDimensions({slabThickness:200,beamWidth:400,beamDepth:800,columnSize:800},true);
  assert.equal(changed.slab,.1); assert.equal(changed.beamWidth,.2); assert.equal(changed.beamDepth,.4); assert.equal(changed.column,.4);
  assert.deepEqual(sceneDimensions({slabThickness:200},false),dimensions);
});

test('scenario reset restores advanced baseline inputs without retaining custom values', () => {
  reset(); const baseline = {...useViewerStore.getState().playgroundParams};
  const custom = {kz:1.3,sd1:1.5,period:2,responseR:3,deadWeight:20000,baseArea:500,targetSF:2.5};
  useViewerStore.getState().setPlaygroundParams(custom);
  assert.equal(useViewerStore.getState().playgroundInputError,null);
  for (const [key,value] of Object.entries(custom)) assert.equal(useViewerStore.getState().playgroundParams[key],value);
  useViewerStore.getState().setActiveDcr(2);
  useViewerStore.getState().applyPlaygroundScenario('normal', {speed:30,rebarCount:5});
  const state = useViewerStore.getState();
  for (const key of ['kz','sd1','period','responseR','deadWeight','baseArea','targetSF']) assert.equal(state.playgroundParams[key], baseline[key]);
  assert.equal(windVelocityPressure(state.playgroundParams),windVelocityPressure({...baseline,speed:30}));
  assert.equal(state.playgroundParams.bars,5);
  assert.equal(state.playgroundParams.rebarCount,5);
  assert.equal(state.activeDcr,null);
});

test('invalid parameter updates are rejected atomically with an explicit input error', () => {
  reset(); const baseline = {...useViewerStore.getState().playgroundParams};
  for (const [key,value] of [['personWeight',0],['floorArea',0],['occupantCount',-1],['phi',90],['targetSF',1],['speed',NaN],['bars',3.5],['beamWidth',1e308]]) {
    useViewerStore.getState().setPlaygroundParam(key,value);
    assert.ok(useViewerStore.getState().playgroundInputError, key);
    assert.deepEqual(useViewerStore.getState().playgroundParams,baseline);
    assert.doesNotThrow(() => floorLoads(useViewerStore.getState().playgroundParams));
  }
  useViewerStore.getState().setPlaygroundParams({speed:40,personWeight:0});
  assert.deepEqual(useViewerStore.getState().playgroundParams,baseline);
  useViewerStore.getState().setPlaygroundParam('speed',0);
  assert.equal(useViewerStore.getState().playgroundInputError,null);
  assert.equal(windVelocityPressure(useViewerStore.getState().playgroundParams),0);
  useViewerStore.getState().setPlaygroundParam('rebarCount',6);
  assert.equal(useViewerStore.getState().playgroundParams.bars,6);
});

test('guided trace shares simulation stages and keeps branch targets together', () => {
  reset(); useViewerStore.getState().select('load-angin');
  useViewerStore.getState().setJourneyStep(2);
  assert.equal(useViewerStore.getState().visualizationMode,'wind');
  assert.equal(useViewerStore.getState().animationPlaying,false);
  assert.deepEqual(LOAD_JOURNEYS.wind[useViewerStore.getState().journeyStep].elementIds,['elem-balok','elem-kolom']);
  assert.deepEqual(LOAD_JOURNEYS.soil[2].elementIds,['elem-pelat-lantai','elem-pondasi']);
  assert.match(LOAD_JOURNEYS.water[2].description,/bukan kelanjutan/);
});

test('presentation stops the tour synchronously and prevents starting it behind hidden controls', () => {
  reset(); useViewerStore.getState().setExhibitionMode(false);
  useViewerStore.getState().setTourPlaying(true);
  assert.equal(useViewerStore.getState().tourPlaying,true);
  useViewerStore.getState().setExhibitionMode(true);
  assert.equal(useViewerStore.getState().tourPlaying,false);
  assert.equal(useViewerStore.getState().visualizationMode,'structure');
  useViewerStore.getState().setTourPlaying(true);
  assert.equal(useViewerStore.getState().tourPlaying,false);
  useViewerStore.getState().setExhibitionMode(false);
  useViewerStore.getState().setTourPlaying(true);
  useViewerStore.getState().select('elem-balok');
  assert.equal(useViewerStore.getState().tourPlaying,false);
});

test('hiding a layer clears stale picking while unrelated material selection is preserved', () => {
  reset(); useViewerStore.getState().select('elem-balok');
  useViewerStore.getState().hover('elem-balok');
  useViewerStore.getState().toggleLayer('substructure');
  assert.equal(useViewerStore.getState().activeId,'elem-balok');
  assert.equal(useViewerStore.getState().hoveredId,null);
  useViewerStore.getState().toggleLayer('superstructure');
  assert.equal(useViewerStore.getState().activeId,null);
  assert.equal(useViewerStore.getState().focusPoint,null);
  useViewerStore.getState().touch('elem-pondasi');
  useViewerStore.getState().toggleLayer('substructure');
  assert.equal(useViewerStore.getState().touchCandidate,null);
});

test('diagram labels are contained below sibling controls and external material drawers', async () => {
  const [scene, css] = await Promise.all([
    readFile(new URL('../src/components/StructureScene.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/globals.css', import.meta.url), 'utf8'),
  ]);
  // Structural guard only; actual overlap still requires a browser check.
  assert.match(scene, /<Canvas\s+style=\{\{ isolation: "isolate" \}\}/);
  assert.match(css, /\.viewer-stage\s*\{\s*isolation:\s*isolate;/);
});
