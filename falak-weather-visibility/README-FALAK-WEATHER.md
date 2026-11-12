# Falak Weather + Crescent Observation Readiness

## What this package adds

- Global hourly forecast lookup by latitude/longitude using Open-Meteo.
- Fetches weather for the astronomical engine's exact `bestTime` (nearest hourly sample, maximum distance 90 minutes).
- Includes total/low/mid/high cloud cover, horizontal visibility, humidity, dew point, precipitation probability/amount, rain, temperature and wind.
- A transparent weather-suitability heuristic, explicitly separate from astronomical visibility classification.

## Important integration rule

Do NOT modify `calculatePrayerTimes`, `calculateMoonData`, `calculateRealCrescent`,
`findLunarMonthStart`, Yallop/Odeh calculations, or their existing thresholds.

Call the new weather service after the existing crescent calculation:

```ts
const crescent = calculateRealCrescent({
  latitude,
  longitude,
  elevation,
  date,
});

const weather = await fetchWeatherForTime(
  { latitude, longitude, elevation },
  crescent.bestTime,
);

const weatherAssessment = assessCrescentWeather(weather);
```

Adapt `crescent.bestTime` to the actual property name returned by the current
`calculateRealCrescent` type. Do not guess or rename existing engine fields.

## Suggested UI separation

1. Astronomical result: keep current Yallop/Odeh class and geometry unchanged.
2. Weather at observation time: show each measured/modelled variable with its unit.
3. Sky suitability: FAVORABLE / MIXED / UNFAVORABLE / UNKNOWN.
4. Always show fetched time, target observation time, location coordinates, source and stale/missing-data state.
5. Never merge the weather score into `visible`, `yallopClass`, or official Hijri month-start logic.

## Data source strategy (hybrid)

### Operational forecast
Open-Meteo Forecast API, using its global model selection and hourly cloud/visibility fields.
The free endpoint is for non-commercial use only and requires attribution. Commercial apps
must use a commercial licence/API plan or another appropriately licensed provider.

### Satellite confirmation (next integration phase)
NOAA OSPO Global Mosaic of Geostationary Satellite Imagery (GMGSI) offers near-global
coverage from 60°N to 60°S, hourly imagery, about 3 km resolution, and typically 2–3 hour
latency. It is useful for visual context and cloud-motion confirmation, but is not a
point-specific numeric cloud observation API in this starter implementation. Do not
pretend its imagery has been sampled at the user's exact coordinates.

For a production satellite pipeline, ingest/interpret the appropriate satellite products
(e.g. Meteosat for Africa/Europe, Himawari for Asia-Pacific, GOES for the Americas) or
use a licensed provider that returns point-based satellite cloud observations.

## API variables used

`temperature_2m`, `relative_humidity_2m`, `dew_point_2m`, `cloud_cover`,
`cloud_cover_low`, `cloud_cover_mid`, `cloud_cover_high`, `visibility`,
`precipitation_probability`, `precipitation`, `rain`, `wind_speed_10m`.

## Operational safeguards

- Request `timezone=UTC` so timestamps parse consistently on every device.
- Never substitute a forecast from a distant hour; this code rejects samples more than 90 minutes away.
- Use abort timeout and surface provider errors to the UI.
- Cache by rounded coordinates + target hour for a short period in the app/service layer if needed.
- Display unavailable values as “غير متاح”; never coerce null to zero.
- Forecasts can be wrong. A field observation report should be a separate data source.

## Verification

1. Test Cairo, Riyadh, London and a southern-hemisphere coordinate.
2. Confirm UTC timestamp equals the requested observation hour.
3. Confirm missing fields remain `null`.
4. Simulate HTTP failure and timeout.
5. Confirm weather failure does not break the astronomical report.
6. Confirm weather result cannot change Yallop/Odeh class or Hijri month start.
7. Add tests against the actual `calculateRealCrescent` output type before wiring into Dashboard.
