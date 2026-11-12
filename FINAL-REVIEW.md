# FALAK – weather assessment and localization review

## Changes in this revision

- Added mid-level and high-level cloud cover as explicit assessment factors; they were previously displayed but omitted from the weighted score.
- Updated operational weights to total 100%: total cloud 30%, low cloud 25%, mid cloud 10%, high cloud 5%, visibility 15%, humidity 10%, precipitation probability 5%.
- Kept low clouds more influential than mid/high clouds because low-level cloud and fog can directly obstruct the near-horizon view. Mid/high cloud weights are lower because the API coverage percentages do not describe optical thickness or transparency.
- Kept all seven weighted factors required: if any is missing, the result is UNKNOWN and no score is shown.
- A result cannot be FAVORABLE when a core obstruction factor (total/low cloud, visibility, or precipitation) is BAD. High-cloud coverage is capped at CAUTION because its percentage does not reveal optical thickness/transparency.
- Added Arabic and English explanations for mid/high cloud impacts and a scientific limitation explaining that cloud-layer percentages are modeled, related to total cover, and do not measure opacity.
- Wrapped numeric values and units in an isolated LTR `bdi` element to reduce bidi reordering in Arabic.
- Fixed the active Open-Meteo request so `timezone: "auto"` is actually sent (a literal escaped newline had previously commented out that property); Unix timestamps are still matched as absolute instants and displayed in the returned location timezone.
- Mirrored the cloud-factor and strict-missing-data logic in the legacy weather module to avoid inconsistent behavior if it is reused.
- Yallop/Odeh astronomical calculations are untouched.

## Weight calculation check for the supplied sample

Sample: total cloud 98% (BAD), low 0% (GOOD), mid 0% (GOOD), high 98% (CAUTION), visibility 23.5 km (GOOD), humidity 47% (GOOD), precipitation probability 0% (GOOD).

Weighted result: 68/100, condition MIXED. High cloud coverage is capped at CAUTION because the percentage does not report optical thickness/transparency; total cloud cover remains the main cloud penalty. This is an operational heuristic, not a scientifically validated probability of crescent sighting.

## Validation

- `tsc -b`: passed.
- Executed the actual assessment function against the supplied sample: 68 / MIXED; high cloud is CAUTION, total cloud is BAD.
- Missing high-cloud data: UNKNOWN with no score.
- Clear-sky sample: 100 / FAVORABLE.
- English/Arabic translation parity: 108 keys in each language; no missing keys.
- `npm run build`: TypeScript phase passed; Vite bundling could not run because the archived `node_modules` lacks the platform-specific Rolldown native binding.
- Translation keys: both English and Arabic definitions were updated in parallel for the new factor explanations and limitation.

## Scientific limitations

Open-Meteo exposes total, low, mid and high cloud-cover variables as model outputs. The altitude bands differ by model documentation, and cloud-cover percentage does not provide optical thickness/transparency. Therefore these weights are explicit product heuristics and should not be represented as scientifically calibrated.
