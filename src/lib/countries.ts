/**
 * Comprehensive list of countries and regions for ResearchForge AI
 */

export interface CountryOption {
  code: string;
  name: string;
}

export const POPULAR_REGIONS = [
  { code: 'GLOBAL', name: 'Global / Worldwide' },
  { code: 'NORTH_AMERICA', name: 'North America' },
  { code: 'EUROPEAN_UNION', name: 'European Union / EEA' },
  { code: 'ASIA_PACIFIC', name: 'Asia Pacific (APAC)' },
  { code: 'LATIN_AMERICA', name: 'Latin America' },
  { code: 'MIDDLE_EAST', name: 'Middle East & North Africa' },
  { code: 'SUB_SAHARAN_AFRICA', name: 'Sub-Saharan Africa' },
  { code: 'CUSTOM', name: 'Custom Country / Custom Multi-Country List' },
];

export const COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PL', name: 'Poland' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'EG', name: 'Egypt' },
  { code: 'KE', name: 'Kenya' },
  { code: 'TR', name: 'Turkey' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'RO', name: 'Romania' },
  { code: 'HU', name: 'Hungary' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'HK', name: 'Hong Kong' },
];

export function formatRegionLabel(region: string, customRegion?: string): string {
  if (region === 'CUSTOM' || region === 'custom') {
    return customRegion && customRegion.trim() ? customRegion.trim() : 'Custom Region';
  }
  const foundPopular = POPULAR_REGIONS.find((r) => r.code === region || r.name === region);
  if (foundPopular) return foundPopular.name;
  const foundCountry = COUNTRIES.find((c) => c.code === region || c.name === region);
  if (foundCountry) return foundCountry.name;
  return region || 'Global / Worldwide';
}

export function formatTimeRangeLabel(range: string, customTimeRange?: string): string {
  switch (range) {
    case 'last_30_days':
      return 'Last 30 Days';
    case 'last_6_months':
      return 'Last 6 Months';
    case 'last_year':
      return 'Last Year (12 Months)';
    case 'last_5_years':
      return 'Last 5 Years';
    case 'custom':
      return customTimeRange && customTimeRange.trim() ? customTimeRange.trim() : 'Custom Time Range';
    default:
      return range;
  }
}
