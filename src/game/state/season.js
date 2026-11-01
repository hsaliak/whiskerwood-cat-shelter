const SOUTHERN_HEMISPHERE_REGIONS = new Set([
  'AU', 'AR', 'BO', 'BR', 'CL', 'EC', 'FJ', 'LS', 'MG', 'MZ', 'NA', 'NZ', 'PE', 'PY', 'SZ', 'UY', 'ZA', 'ZW',
]);

export function getHemisphereForLocale(locale) {
  try {
    const region = new Intl.Locale(locale || 'en').region;
    return SOUTHERN_HEMISPHERE_REGIONS.has(region) ? 'south' : 'north';
  } catch {
    return 'north';
  }
}

export function getSeasonForLocale(date = new Date(), locale = 'en', preference = 'auto') {
  const hemisphere = ['north', 'south'].includes(preference)
    ? preference
    : getHemisphereForLocale(locale);
  return getSeasonForDate(date, hemisphere);
}

export function getSeasonForDate(date = new Date(), hemisphere = 'north') {
  const month = date.getMonth();
  const seasonMonth = hemisphere === 'south' ? (month + 6) % 12 : month;
  if (seasonMonth === 11 || seasonMonth < 2) return 'winter';
  if (seasonMonth < 5) return 'spring';
  if (seasonMonth < 8) return 'summer';
  return 'autumn';
}
