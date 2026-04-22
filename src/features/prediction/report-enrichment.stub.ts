/** Deterministic demo flags until you have GIS layers for schools / hospitals / clusters. */
export function stubReportEnrichment(latitude: number, longitude: number) {
  const s = Math.sin(latitude * 12.9898 + longitude * 78.233) * 43758.5453;
  const f = Math.abs(s - Math.floor(s));
  const h = Math.floor(f * 1000);
  return {
    nearSchool: h % 6 === 0,
    nearHospital: h % 9 === 2,
    reportCountNearby: 1 + (h % 9),
    roadAgeYears: 3 + (h % 22),
  };
}
