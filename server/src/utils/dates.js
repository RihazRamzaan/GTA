// Event gate/date helpers belong to Rihaz and Tharushi feature work.
export const isDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

/**
 * Safely parse an ISO date string, timestamp, or Date instance into a valid Date object or null.
 *
 * @param {Date | string | number} value
 * @returns {Date | null}
 */
export const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Formats a date into Asia/Colombo time for display/logging.
 *
 * @param {Date | string | number} value
 * @returns {string}
 */
export function formatColomboTime(value) {
  const date = parseDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Validates milestone chronology according to Buildathon requirements:
 * - registrationOpensAt < registrationClosesAt
 * - submissionOpensAt < submissionClosesAt
 * - Chronological sequence:
 *   registrationOpensAt <= buildingStartsAt <= submissionOpensAt <= resultsAt
 *   and submissionClosesAt <= resultsAt
 *
 * @param {Object} milestones
 * @returns {{ valid: boolean, errors: string[], parsed: Record<string, Date> }}
 */
export function validateMilestonesChronology(milestones) {
  const errors = [];
  if (!milestones || typeof milestones !== 'object') {
    return { valid: false, errors: ['Milestones object is required.'], parsed: {} };
  }

  const keys = [
    'registrationOpensAt',
    'registrationClosesAt',
    'buildingStartsAt',
    'submissionOpensAt',
    'submissionClosesAt',
    'resultsAt',
  ];

  const parsed = {};
  for (const key of keys) {
    if (milestones[key] !== undefined && milestones[key] !== null) {
      const d = parseDate(milestones[key]);
      if (!d) {
        errors.push(`Invalid date format for '${key}'.`);
      } else {
        parsed[key] = d;
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, parsed };
  }

  if (parsed.registrationOpensAt && parsed.registrationClosesAt) {
    if (parsed.registrationOpensAt >= parsed.registrationClosesAt) {
      errors.push('registrationOpensAt must be before registrationClosesAt.');
    }
  }

  if (parsed.submissionOpensAt && parsed.submissionClosesAt) {
    if (parsed.submissionOpensAt >= parsed.submissionClosesAt) {
      errors.push('submissionOpensAt must be before submissionClosesAt.');
    }
  }

  if (parsed.registrationOpensAt && parsed.buildingStartsAt) {
    if (parsed.registrationOpensAt > parsed.buildingStartsAt) {
      errors.push('registrationOpensAt cannot be after buildingStartsAt.');
    }
  }

  if (parsed.buildingStartsAt && parsed.submissionOpensAt) {
    if (parsed.buildingStartsAt > parsed.submissionOpensAt) {
      errors.push('buildingStartsAt cannot be after submissionOpensAt.');
    }
  }

  if (parsed.submissionClosesAt && parsed.resultsAt) {
    if (parsed.submissionClosesAt > parsed.resultsAt) {
      errors.push('submissionClosesAt cannot be after resultsAt.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    parsed,
  };
}
