export const SEASONS = {
  DEFAULT: 'default',
  HALLOWEEN: 'halloween',
  WINTER: 'winter'
}

function normalizedBase(base = import.meta.env.BASE_URL || '/') {
  return base.endsWith('/') ? base : `${base}/`
}

/**
 * Picks a seasonal logo. Override with VITE_SEASON_OVERRIDE=default|halloween|winter.
 */
export function getSeason(now = new Date()) {
  const override = import.meta.env.VITE_SEASON_OVERRIDE?.toLowerCase()

  if (
    override === SEASONS.DEFAULT ||
    override === SEASONS.HALLOWEEN ||
    override === SEASONS.WINTER
  ) {
    return override
  }

  const month = now.getUTCMonth() + 1
  const day = now.getUTCDate()

  if ((month === 10 && day >= 15) || (month === 11 && day <= 1)) {
    return SEASONS.HALLOWEEN
  }

  if (month === 12 || (month === 1 && day <= 7)) {
    return SEASONS.WINTER
  }

  return SEASONS.DEFAULT
}

const logoBySeason = {
  [SEASONS.DEFAULT]: 'logos/Tiny-logo.png',
  [SEASONS.HALLOWEEN]: 'logos/Tiny-halloween.png',
  [SEASONS.WINTER]: 'logos/Tiny-xmas.png'
}

export function seasonLogoSrc(season = getSeason()) {
  const logoPath = logoBySeason[season] || logoBySeason[SEASONS.DEFAULT]
  return `${normalizedBase()}${logoPath}`
}
