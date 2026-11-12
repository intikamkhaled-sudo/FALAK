# FALAK final review — 12 Nov 2026

## Weather scoring correction

Cloud cover and low/mid/high cloud-layer percentages are correlated model outputs.
They are now combined into one cloud component instead of being added as four
independent top-level score weights.

- Cloud component: 45% of the total score
  - Total cloud cover: 60% of the cloud component
  - Low clouds: 25%
  - Mid clouds: 10%
  - High clouds: 5%
- Visibility: 25%
- Relative humidity: 15%
- Precipitation probability: 15%

Layer-specific values and explanations remain visible in the UI. The score remains
an operational heuristic, not a validated probability of crescent sighting.
Yallop/Odeh calculations are not changed.

## Example regression check

For the supplied values (total cloud 98%, low 0%, mid 0%, high 98%,
visibility 23.5 km, humidity 47%, precipitation probability 0%), the revised
formula gives 72/100 (rounded), rather than the previous 68/100. The difference
comes from replacing the duplicated top-level cloud weights with one grouped
cloud component. For this case, the grouped cloud component is 37.5/100; the
other three components are each 100/100.

## Other reviewed behavior

- Forecast sample selection remains limited to 30 minutes from the requested time.
- Open-Meteo uses `timezone=auto` and Unix timestamps for unambiguous instants.
- Arabic and English translation strings explain the grouped cloud calculation.
- Numeric values remain isolated from RTL text and use explicit spacing before units.

## Validation boundary

This archive contains source changes only. A production build should be run with
`npm ci` followed by `npm run build` in an environment with network access and the
platform-specific Vite dependencies available.
