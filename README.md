# 🌙 FALAK

**FALAK** is an astronomy-based Islamic companion application developed by **ENG/Khaled Ismail**.

The project combines astronomical calculations with a modern responsive interface to provide prayer times, Hijri calendar information, lunar data, crescent visibility analysis, and Qibla direction.

---

## ✨ Features

### 🕌 Prayer Times

Prayer times are calculated from astronomical solar positions using geographic coordinates.

The application currently supports:

- Fajr
- Sunrise
- Dhuhr
- Asr
- Maghrib
- Isha
- Next prayer detection
- Prayer countdown

### 🌙 Astronomical Hijri Calendar

FALAK includes a location-based astronomical Hijri calendar engine.

The calculation uses astronomical events including:

- Lunar conjunction
- Local sunset
- Moonset
- Crescent geometry
- Crescent visibility
- Lunar month start
- Sunset-to-sunset Hijri day progression

The calendar is designed to derive the Hijri date from astronomical calculations rather than relying solely on a pre-generated calendar table.

### 🔭 Crescent Visibility

The crescent module evaluates astronomical parameters including:

- Moon age
- Elongation
- ARCL
- ARCV
- Relative azimuth
- Crescent width
- Moon altitude
- Moonset lag
- Illumination

The project also includes a Yallop-based crescent visibility classification.

### 🧭 Live Qibla Compass

FALAK calculates the Qibla bearing dynamically from the user's geographic coordinates.

On supported mobile devices, the application can use device orientation sensors to provide a live Qibla compass.

The module also calculates the approximate great-circle distance to the Kaaba.

### 🌍 Location Based

Astronomical calculations use geographic parameters including:

- Latitude
- Longitude
- Elevation

This allows calculations to adapt to the selected location.

### 🌐 Languages

FALAK currently supports:

- Arabic
- English
- RTL / LTR interface switching

---

## 🛠 Technology

FALAK is built with:

- React
- TypeScript
- Vite
- Astronomy Engine
- Browser Geolocation API
- Device Orientation API

---

## 👨‍💻 Creator & Developer

**ENG/Khaled Ismail**

Creator, developer, and project owner of FALAK.

---

## 📌 Project Status

Current development milestone:

**FALAK v1.0.0**

The project is under active development and astronomical calculations may continue to be validated and refined.

---

## ⚠️ Disclaimer

FALAK provides astronomical calculations and informational results.

Prayer times, crescent visibility, and Hijri calendar practices may vary according to calculation methods, observational criteria, local authorities, and religious institutions.

Users should consult the relevant local authority when an officially adopted religious date or prayer schedule is required.

---

## © Copyright

Copyright © 2026 ENG/Khaled Ismail.

All Rights Reserved.

No permission is granted to copy, modify, distribute, sublicense, or commercially use the source code or substantial portions of this project without prior written permission from the copyright holder.
