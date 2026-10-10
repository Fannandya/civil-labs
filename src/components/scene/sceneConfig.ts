/** Member cross sections use a common display scale. The building layout is schematic. */
export function sceneDimensions(params: Record<string, number>, playground: boolean) {
  const display = (key: string, fallback: number) => (playground ? params[key] ?? fallback : fallback) * .0005;
  return {
    slab: display("slabThickness", 140),
    beamWidth: display("beamWidth", 300),
    beamDepth: display("beamDepth", 600),
    column: display("columnSize", 600)
  };
}
