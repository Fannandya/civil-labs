"use client";

import { useRef, type ComponentProps } from "react";
import { Html, Line } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { deformPoint } from "@/lib/structuralMotion";
import { useStructuralMotion } from "./scene/StructuralMotion";
import { useViewerStore } from "@/store/viewer";
import {
  distributeSeismicForces,
  floorLoads,
  seismicBaseShear,
  soilAtRestForce,
  upliftStability,
  windVelocityPressure
} from "../lib/engineeringCalculations";
import { sceneDimensions } from "./scene/sceneConfig";
import { MODEL_LEVELS, SEISMIC_FLOOR_HEIGHTS } from "@/lib/modelLevels";
import {
  FlowPath,
  ForceArrow,
  Point3,
  PressureEnvelope,
  SoilReactionVector,
  TributaryEnvelope,
  TributaryLoadFlow,
  VECTOR_COLORS
} from "./scene/ScenePrimitives";

type LoadProps = {
  onPick: (id: string, event: ThreeEvent<MouseEvent>, point: Point3) => void;
  onHover: (id: string | null) => void;
};

function LoadGroup({ id, point, children, onPick, onHover }: LoadProps & {
  id: string;
  point: Point3;
  children: React.ReactNode;
}) {
  return (
    <group
      name={id}
      onClick={(event) => {
        event.stopPropagation();
        onPick(id, event, point);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(id);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "";
        onHover(null);
      }}
    >
      {children}
    </group>
  );
}

function VectorLabel({ position, children, color, subtitle, compact = false }: {
  position: Point3;
  children: React.ReactNode;
  color: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const labels = useViewerStore((s) => s.showLabels);
  const anchor = useRef<Group>(null);
  const motion = useStructuralMotion();
  useFrame(() => {
    if (anchor.current) deformPoint(...position, motion.current, anchor.current.position);
  });
  if (!labels) return null;
  return (
    <group ref={anchor} position={position}>
    <Html center pointerEvents="none" zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
      <div aria-hidden="true" className={`vector-label${compact ? " vector-label-compact" : ""} select-none pointer-events-none`} style={{ borderLeftColor: color }}>
        <div className="font-semibold">{children}</div>
        {subtitle && <div className="vector-label-detail">{subtitle}</div>}
      </div>
    </Html>
    </group>
  );
}

/** Force field arrows deform with structure and show energetic pulse flow when playing. */
function LoadFieldArrow(props: ComponentProps<typeof ForceArrow>) {
  const playing = useViewerStore((s) => s.animationPlaying);
  return <ForceArrow {...props} deform animate={playing && props.animate !== false} />;
}

/** Ground marker shares the foundation translation used by the structure. */
function GroundMotionIndicator() {
  const marker = useRef<Mesh>(null);
  const motion = useStructuralMotion();
  const groundLines = useRef<Group>(null);
  const color = VECTOR_COLORS.seismic;

  useFrame(() => {
    if (marker.current) {
      marker.current.position.x = 2.5 + motion.current.baseX;
    }
    if (groundLines.current) groundLines.current.position.x = motion.current.baseX;
  });

  return (
    <group name="Schematic_Ground_Motion">
      <Line points={[[2.05, 0.2, 1.85], [2.95, 0.2, 1.85]]} color={color} lineWidth={2.0} />
      <Line points={[[2.2, 0.3, 1.85], [2.05, 0.2, 1.85], [2.2, 0.1, 1.85]]} color={color} lineWidth={2.0} />
      <Line points={[[2.8, 0.3, 1.85], [2.95, 0.2, 1.85], [2.8, 0.1, 1.85]]} color={color} lineWidth={2.0} />
      <mesh ref={marker} position={[2.5, 0.2, 1.85]}>
        <boxGeometry args={[0.045, 0.18, 0.045]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} />
      </mesh>
      <group ref={groundLines}>
      {[-0.2, 0, 0.2].map((dy, i) => (
        <Line
          key={i}
          points={[
            [-2.2, -4.32 + dy * 0.15, 1.8],
            [-1.1, -4.32 + dy * 0.15, 1.8],
            [0, -4.32 + dy * 0.15, 1.8],
            [1.1, -4.32 + dy * 0.15, 1.8],
            [2.2, -4.32 + dy * 0.15, 1.8]
          ]}
          color={color}
          lineWidth={1.6}
          dashed
          dashSize={0.12}
          gapSize={0.08}
          transparent
          opacity={0.55}
        />
      ))}
      </group>
      <VectorLabel position={[2.5, -0.12, 1.85]} color={color}>Gerak tanah seismik · ±X</VectorLabel>
    </group>
  );
}

/** Uniform factored gravity load and a schematic tributary envelope. */
export function GravityLoadSystem(props: LoadProps) {
  const mode = useViewerStore((s) => s.visualizationMode);
  const params = useViewerStore((s) => s.playgroundParams);
  const playground = useViewerStore((s) => s.isPlaygroundActive);
  const loads = floorLoads(params);
  const roof = 4.35 + sceneDimensions(params, playground).slab / 2;
  const length = Math.min(1.8, loads.factored / 9);
  const color = VECTOR_COLORS.gravity;

  return (
    <LoadGroup {...props} id="load-gravitasi" point={[0, roof, 0]}>
      {/* Schematic two-way tributary envelope */}
      <TributaryEnvelope center={[0, roof + 0.015, 0]} width={3.3} depth={2.5} color={color} />
      {mode === "structure" && <TributaryLoadFlow center={[0, roof + 0.015, 0]} width={3.3} depth={2.5} color={color} />}

      {/* Uniform factored pressure qu = max(1.4D, 1.2D + 1.6L) */}
      {loads.factored > 0 &&
        [-1.1, 0, 1.1].flatMap((x) =>
          [-0.72, 0, 0.72].map((z) => (
            <LoadFieldArrow
              key={`${x}-${z}`}
              start={[x, roof + length + 0.02, z]}
              end={[x, roof + 0.02, z]}
              color={color}
              radius={0.023}
              pulseSpeed={0.3}
            />
          ))
        )}
      <PressureEnvelope
        color={color}
        opacity={0.06}
        points={[
          [-1.65, roof + 0.008, -1.25],
          [1.65, roof + 0.008, -1.25],
          [1.65, roof + 0.008, 1.25],
          [-1.65, roof + 0.008, 1.25]
        ]}
      />
      <VectorLabel
        position={[0, roof + length + 0.38, 0]}
        color={color}
        subtitle={`qu = maks(1,4D; 1,2D + 1,6L) · D ${loads.dead.toFixed(2)} / L ${loads.liveDesign.toFixed(2)} kN/m²`}
      >
        Beban merata ↓ · qu = {loads.factored.toFixed(2)} kN/m²
      </VectorLabel>
    </LoadGroup>
  );
}

/** Continuous multi-floor illustrative load routes through slab, beam, column, shear wall, raft, and piles. */
export function CurvedLoadPathSystem() {
  const layers = useViewerStore((s) => s.layers);
  const params = useViewerStore((s) => s.playgroundParams);
  const playground = useViewerStore((s) => s.isPlaygroundActive);
  const dimensions = sceneDimensions(params, playground);
  const roof = 4.35 + dimensions.slab / 2 + 0.025;
  const beam = 4.35 - dimensions.slab / 2 - dimensions.beamDepth / 2;
  const corners: [number, number][] = [
    [-1.65, -1.25],
    [1.65, -1.25],
    [-1.65, 1.25],
    [1.65, 1.25]
  ];

  return (
    <group name="Continuous_Load_Path_System">
      {/* 1. Four Corner Columns: Continuous multi-floor axial compression cascade */}
      {corners.map(([x, z]) => {
        const points: Point3[] = [];
        if (layers.superstructure) {
          // Slab surface to perimeter beam, then down column floors
          points.push(
            [x / 2, roof, z / 2],
            [x / 2, roof, z],
            [x / 2, beam, z],
            [x, beam, z],
            [x, 3.05, z],
            [x, 1.75, z],
            [x, 0.45, z]
          );
        }
        if (layers.substructure) {
          if (!layers.superstructure) points.push([x, 0.45, z]);
          points.push(
            [x, -0.825, z],
            [x, -2.1, z],
            [x, -2.465, z],
            [x, -4.25, z]
          );
        }
        return (
          <group key={`${x}-${z}`}>
            {points.length > 1 && (
              <FlowPath
                points={points}
                count={4}
                speed={0.16}
                beadSize={0.034}
                lineWidth={2.4}
                lineOpacity={0.7}
                color={VECTOR_COLORS.transfer}
              />
            )}
            {/* Downward reaction point arrows at beam-column joint */}
            {layers.superstructure && (
              <ForceArrow
                start={[x, beam + 0.22, z]}
                end={[x, beam - 0.05, z]}
                color={VECTOR_COLORS.gravity}
                radius={0.022}
                pulseSpeed={0.3}
              />
            )}
            {/* Upward soil skin friction & end-bearing reaction vectors at pile */}
            {layers.substructure && (
              <SoilReactionVector position={[x, -3.35, z]} height={1.8} color={VECTOR_COLORS.reaction} />
            )}
          </group>
        );
      })}

      {/* 2. Central Shear Wall Core: Vertical gravity compression cascade */}
      {layers.superstructure && (
        <FlowPath
          points={[
            [0, roof, 0],
            [0, roof, -0.65],
            [0, 4.35, -0.65],
            [0, 3.05, -0.65],
            [0, 1.75, -0.65],
            [0, 0.45, -0.65],
            ...(layers.substructure ? ([[0, -0.825, -0.65], [0, -2.275, -0.65]] as Point3[]) : [])
          ]}
          count={3}
          speed={0.14}
          beadSize={0.034}
          lineWidth={2.4}
          lineOpacity={0.7}
          color={VECTOR_COLORS.transfer}
        />
      )}
    </group>
  );
}

/** One input Kz gives one qz reference; aerodynamic flow and diaphragm transfer into structural framing. */
export function WindLoadSystem(props: LoadProps) {
  const mode = useViewerStore((s) => s.visualizationMode);
  const step = useViewerStore((s) => s.journeyStep);
  const params = useViewerStore((s) => s.playgroundParams);
  const windSpeed = params.speed ?? 35;
  const qz = windVelocityPressure(params);
  const length = Math.min(2.1, qz / 500);
  const face = -1.82;
  const color = VECTOR_COLORS.wind;

  // Schematic wind-flow guides around the building.
  const streamlines: Point3[][] = [
    [[-4.5, 4.5, 0], [-2.4, 4.75, 0], [0, 5.3, 0], [2.4, 4.95, 0], [4.2, 4.55, 0]],
    [[-4.5, 2.9, 0], [-2.3, 2.9, 0], [-1.9, 2.9, 1.45], [0, 2.9, 1.9], [2.4, 2.9, 1.55], [4.2, 2.9, 0.7]],
    [[-4.5, 1.95, -1.85], [-2.4, 1.95, -1.85], [0, 1.95, -1.95], [2.4, 1.95, -1.85], [4.2, 1.95, -1.85]],
    [[-4.5, 1.95, 1.85], [-2.4, 1.95, 1.85], [0, 1.95, 1.95], [2.4, 1.95, 1.85], [4.2, 1.95, 1.85]]
  ];

  return (
    <LoadGroup {...props} id="load-angin" point={[face, 2.4, 0]}>
      {qz > 0 && (
        <>
          {/* 1. Aerodynamic Windward Pressure Envelope */}
          <PressureEnvelope
            color={color}
            opacity={0.08}
            points={[
              [face, 0.45, 1.35],
              [face - length, 0.45, 1.35],
              [face - length, 4.35, 1.35],
              [face, 4.35, 1.35]
            ]}
          />

          {/* One reference qz: equal pressure glyphs at each display elevation */}
          {[0.75, 1.85, 2.95, 4.05].flatMap((y) => [-0.7, 0.7].map((z) => (
              <LoadFieldArrow
                key={`${y}-${z}`}
                start={[face - length, y, z]}
                end={[face, y, z]}
                color={color}
                radius={0.024}
                pulseSpeed={0.25}
              />
            )))}

          {/* 3. Aerodynamic Flow Streamlines */}
          {(mode === "structure" || step === 0) && streamlines.map((points, index) => (
            <FlowPath
              key={index}
              points={points}
              count={3}
              speed={0.14}
              beadSize={0.03}
              color={color}
              lineWidth={2.0}
              lineOpacity={0.7}
            />
          ))}
        </>
      )}

      <VectorLabel
        position={[-3.1, 4.65, 1.35]}
        color={color}
        subtitle={`V = ${windSpeed.toFixed(0)} m/s · satu nilai tekanan kecepatan angin acuan (qz)`}
      >
        qz = {(qz / 1000).toFixed(3)} kPa · tekanan kecepatan angin acuan
      </VectorLabel>
      <VectorLabel
        position={[-3.1, 0.08, 1.35]}
        color={color}
        subtitle="Tekanan fasad diteruskan melalui diafragma pelat ke rangka arah X dan pondasi."
      >
        Arah angin +X · alur transfer lateral
      </VectorLabel>
    </LoadGroup>
  );
}

/** Discrete ELF floor forces; the staged guide shows an illustrative X-frame transfer route. */
export function SeismicLoadSystem(props: LoadProps) {
  const params = useViewerStore((s) => s.playgroundParams);
  const seismic = seismicBaseShear(params);
  const heights = SEISMIC_FLOOR_HEIGHTS;
  const forces = distributeSeismicForces([1, 1, 1, 1], heights, seismic.shear, seismic.exponent);
  const scale = Math.min(1 / 280, 3 / Math.max(...forces, 1));
  const color = VECTOR_COLORS.seismic;
  const faceZ = 1.58;

  return (
    <LoadGroup {...props} id="load-gempa" point={[0, 2.4, faceZ]}>
      {/* 1. Floor-by-floor ELF Lateral Inertial Forces */}
      {MODEL_LEVELS.map(({ sceneY: y }, index) => (
        <group key={y}>
          <Line points={[[-1.65, y, faceZ], [1.65, y, faceZ]]} color={color} lineWidth={1.2} transparent opacity={0.35} />
          {forces[index] > 0 && (
            <LoadFieldArrow
              start={[-1.45, y + 0.07, faceZ]}
              end={[-1.45 + forces[index] * scale, y + 0.07, faceZ]}
              color={color}
              radius={0.028}
              pulseSpeed={0.24}
            />
          )}
          <VectorLabel
            position={[-2.25, y + 0.12, faceZ]}
            color={color}
            compact
            subtitle={`tinggi dari dasar hx = ${heights[index].toFixed(1)} m · gaya tingkat Fx = ${forces[index].toFixed(1)} kN`}
          >
            Tingkat {index + 1} · Fx
          </VectorLabel>
        </group>
      ))}

      <VectorLabel
        position={[0, -0.02, 1.85]}
        color={color}
        subtitle={`Statik ekuivalen (ELF) · Cs = ${seismic.cs.toFixed(4)} · jumlah gaya tingkat sama dengan geser dasar`}
      >
        ΣFx = V = {seismic.shear.toFixed(1)} kN · gaya geser dasar
      </VectorLabel>
      <GroundMotionIndicator />
    </LoadGroup>
  );
}

/** Dry homogeneous soil at rest: sigma_h = K0 gamma z and triangular pressure profile. */
export function SoilPressureSystem(props: LoadProps) {
  const params = useViewerStore((s) => s.playgroundParams);
  const soil = soilAtRestForce(params);
  const height = params.height ?? 4;
  const basePressure = 2 * soil.force / height;
  const maximum = Math.min(2.2, basePressure / 24);
  const color = VECTOR_COLORS.soil;
  const top = 0.25;
  const base = -2.1;
  const face = -1.82;
  const zPlanes = [-0.6, 0.1, 0.8];
  const resultantY = base + (top - base) / 3;

  return (
    <LoadGroup {...props} id="load-tekanan-tanah" point={[face, -1, 0.7]}>
      {/* 1. Full 3D Triangular Soil Lateral Pressure Envelope */}
      <PressureEnvelope
        color={color}
        opacity={0.12}
        points={[
          [face, top, 0.8],
          [face, base, 0.8],
          [face - maximum, base, 0.8]
        ]}
      />

      {/* 2. Multi-column 3D Earth Pressure Arrow Field */}
      {zPlanes.map((z) =>
        [0.25, 0.5, 0.75, 1].map((fraction) => (
          <LoadFieldArrow
            key={`soil-${z}-${fraction}`}
            start={[face - maximum * fraction, top + (base - top) * fraction, z]}
            end={[face, top + (base - top) * fraction, z]}
            color={color}
            radius={0.022}
            pulseSpeed={0.22}
          />
        ))
      )}

      <Line points={[[face, top, 0.8], [face - maximum, base, 0.8]]} color={color} lineWidth={1.8} />
      <Line points={[[face - maximum - 0.16, top, 0.8], [face - maximum - 0.16, base, 0.8]]} color={color} lineWidth={1} />
      {[top, base].map((y) => (
        <Line key={y} points={[[face - maximum - 0.24, y, 0.8], [face - maximum - 0.08, y, 0.8]]} color={color} lineWidth={1} />
      ))}

      {/* 3. Resultant Lateral Force P0 acting at H/3 above the base */}
      <Line
        points={[[face - maximum, resultantY, 1.4], [face, resultantY, 1.4]]}
        color={color}
        dashed
        dashSize={0.075}
        gapSize={0.05}
        lineWidth={1.6}
      />
      <LoadFieldArrow
        start={[face - maximum * (2 / 3), resultantY, 1.4]}
        end={[face, resultantY, 1.4]}
        color={color}
        radius={0.034}
        pulseSpeed={0.25}
      />

      <VectorLabel
        position={[face - maximum / 2, top + 0.28, 0.7]}
        color={color}
        subtitle={`H = ${height.toFixed(1)} m · K₀ = ${soil.k0.toFixed(3)} (koefisien tanah diam) · γ = 18 kN/m³`}
      >
        Tanah diam · tekanan mendatar σh = 0 di permukaan
      </VectorLabel>
      <VectorLabel
        position={[face - maximum / 2, base - 0.27, 0.7]}
        color={color}
        subtitle="Tanah kering homogen; ditumpu pelat lantai (atas) dan pelat pondasi (dasar)."
      >
        Tekanan mendatar σh dasar = {basePressure.toFixed(1)} kPa
      </VectorLabel>
      <VectorLabel
        position={[-2.75, resultantY, 1.85]}
        color={color}
        subtitle={`Resultan tekanan tanah per m dinding · ${soil.applicationHeight.toFixed(2)} m dari dasar (H/3)`}
      >
        P₀ = {soil.force.toFixed(1)} kN/m
      </VectorLabel>
    </LoadGroup>
  );
}

/** Independent lateral hydrostatic pressure and uplift with a weight/U target check. */
export function WaterPressureSystem(props: LoadProps) {
  const params = useViewerStore((s) => s.playgroundParams);
  const waterDepth = params.waterDepth ?? 2;
  const height = params.height ?? 4;
  const head = params.waterHead ?? 3;
  const submerged = Math.max(0, height - waterDepth);
  const top = 0.25;
  const base = -2.1;
  const face = -1.82;
  const waterY = top - (Math.min(waterDepth, height) / height) * (top - base);
  const length = Math.min(2.1, (9.81 * submerged) / 20);
  const uplift = upliftStability(params);
  const upliftColor = uplift.ratio > 1 ? VECTOR_COLORS.danger : VECTOR_COLORS.water;
  const arrowHeight = Math.min(1.4, (9.81 * head) / 30);
  const foundationBottom = -2.47;
  const color = VECTOR_COLORS.water;

  return (
    <LoadGroup {...props} id="load-tekanan-air" point={[face, -1.6, 0.7]}>
      {/* 1. Groundwater Table (MAT) Shimmering Plane */}
      {submerged > 0 && (
        <>
          <mesh position={[0, waterY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.8, 3.8]} />
            <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
          </mesh>
          <Line points={[[-4.2, waterY, 0.7], [face, waterY, 0.7]]} color={color} lineWidth={2.0} dashed dashSize={0.12} gapSize={0.06} />

          {/* 2. Hydrostatic Lateral Pressure Envelope below MAT */}
          <PressureEnvelope
            color={color}
            opacity={0.14}
            points={[
              [face, waterY, 0.7],
              [face, base, 0.7],
              [face - length, base, 0.7]
            ]}
          />

          {/* 3. Lateral Hydrostatic Pressure Arrows pushing into Basement Wall */}
          {[-0.4, 0.3, 0.8].map((z) =>
            [0.25, 0.5, 0.75, 1].map((fraction) => (
              <LoadFieldArrow
                key={`water-${z}-${fraction}`}
                start={[face - length * fraction, waterY + (base - waterY) * fraction, z]}
                end={[face, waterY + (base - waterY) * fraction, z]}
                color={color}
                radius={0.022}
                pulseSpeed={0.22}
              />
            ))
          )}

        </>
      )}

      {/* 4. Uplift Buoyancy Pressure Field Under Raft Foundation */}
      {head > 0 && (
        <group name="Uplift_Vectors">
          {/* 3x3 Grid of Upward Buoyancy Arrows */}
          {[-1.2, 0, 1.2].flatMap((x) =>
            [-0.65, 0, 0.65].map((z) => (
              <LoadFieldArrow
                key={`uplift-${x}-${z}`}
                start={[x, foundationBottom - arrowHeight, z]}
                end={[x, foundationBottom, z]}
                color={upliftColor}
                radius={0.024}
                pulseSpeed={0.24}
              />
            ))
          )}
          <PressureEnvelope
            color={upliftColor}
            opacity={0.06}
            points={[
              [-1.65, foundationBottom - 0.005, -1.05],
              [1.65, foundationBottom - 0.005, -1.05],
              [1.65, foundationBottom - 0.005, 1.05],
              [-1.65, foundationBottom - 0.005, 1.05]
            ]}
          />
        </group>
      )}

      <VectorLabel
        position={[-3.1, waterY + 0.24, 0.7]}
        color={color}
        subtitle={
          submerged > 0
            ? `u = 0 pada muka air tanah (MAT) · tinggi terendam ${submerged.toFixed(1)} m`
            : "Tanpa tekanan lateral air pada dinding model."
        }
      >
        Muka air tanah · {waterDepth.toFixed(1)} m di bawah permukaan
      </VectorLabel>
      <VectorLabel
        position={[-3.1, base - 0.25, 0.7]}
        color={color}
        subtitle="Tekanan air u = γw × kedalaman di bawah muka air tanah; nilainya bertambah linier."
      >
        Tekanan air u di dasar dinding = {(9.81 * submerged).toFixed(1)} kPa
      </VectorLabel>
      <VectorLabel
        position={[0, -3.55, 1.55]}
        color={upliftColor}
        subtitle={
          head === 0
            ? "Tinggi tekan air h = 0 · gaya angkat U = 0."
            : `Tinggi tekan air h = ${head.toFixed(1)} m · rasio berat/gaya angkat W/U = ${uplift.sf.toFixed(2)} / target ${uplift.targetSF.toFixed(2)} · ${
                uplift.ratio <= 1 ? "Target rasio W/U terpenuhi" : "Target rasio W/U belum terpenuhi"
              } · pemeriksaan berat saja`
        }
      >
        Gaya angkat air ↑ · U = {uplift.uplift.toFixed(0)} kN
      </VectorLabel>
    </LoadGroup>
  );
}
