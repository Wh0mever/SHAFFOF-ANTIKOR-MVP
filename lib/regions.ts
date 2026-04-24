// Maps geoJSON feature.properties.shapeName (English) to canonical UZ region key.
// Source: geoBoundaries UZB ADM1 (ODbL, OpenStreetMap).
export const GEOJSON_NAME_MAP: Record<string, string> = {
  "Tashkent": "Toshkent shahri",
  "Tashkent Region": "Toshkent viloyati",
  "Samarqand Region": "Samarqand viloyati",
  "Bukhara Region": "Buxoro viloyati",
  "Andijan Region": "Andijon viloyati",
  "Fergana Region": "Farg'ona viloyati",
  "Namangan Region": "Namangan viloyati",
  "Qashqadaryo Region": "Qashqadaryo viloyati",
  "Surxondaryo Region": "Surxondaryo viloyati",
  "Jizzakh Region": "Jizzax viloyati",
  "Sirdaryo Region": "Sirdaryo viloyati",
  "Navoiy Region": "Navoiy viloyati",
  "Xorazm Region": "Xorazm viloyati",
  "Republic of Karakalpakstan": "Qoraqalpog'iston Respublikasi",
};

export const UZ_REGIONS: Record<string, { lat: number; lon: number; nameUz: string }> = {
  "Toshkent shahri":               { lat: 41.2995, lon: 69.2401, nameUz: "Toshkent shahri" },
  "Toshkent viloyati":             { lat: 41.0058, lon: 69.5823, nameUz: "Toshkent viloyati" },
  "Samarqand viloyati":            { lat: 39.6542, lon: 66.9597, nameUz: "Samarqand" },
  "Buxoro viloyati":               { lat: 39.7681, lon: 64.4556, nameUz: "Buxoro" },
  "Andijon viloyati":              { lat: 40.7821, lon: 72.3442, nameUz: "Andijon" },
  "Farg'ona viloyati":             { lat: 40.3842, lon: 71.7843, nameUz: "Farg'ona" },
  "Namangan viloyati":             { lat: 40.9983, lon: 71.6726, nameUz: "Namangan" },
  "Qashqadaryo viloyati":          { lat: 38.8606, lon: 65.7890, nameUz: "Qashqadaryo" },
  "Surxondaryo viloyati":          { lat: 37.9464, lon: 67.5700, nameUz: "Surxondaryo" },
  "Jizzax viloyati":               { lat: 40.1158, lon: 67.8422, nameUz: "Jizzax" },
  "Sirdaryo viloyati":             { lat: 40.3846, lon: 68.7102, nameUz: "Sirdaryo" },
  "Navoiy viloyati":               { lat: 40.0844, lon: 65.3792, nameUz: "Navoiy" },
  "Xorazm viloyati":               { lat: 41.5486, lon: 60.6317, nameUz: "Xorazm" },
  "Qoraqalpog'iston Respublikasi": { lat: 42.4614, lon: 59.6087, nameUz: "Qoraqalpog'iston" }
};
