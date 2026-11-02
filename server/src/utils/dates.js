// Event gate/date helpers belong to Rihaz and Tharushi feature work.
export const isDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

/**
 * Safely parse an ISO date string or Date instance into a valid Date object or null.
 */
export const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Validates milestone chronology according to Buildathon requirements:
 * - registrationOpensAt < registrationClosesAt
 * - submissionOpensAt < submissionClosesAt
 * - Chronological sequence: registrationOpensAt <= buildingStartsAt <= submissionOpensAt <= resultsAt
 */
export function validateMilestonesChronology(milestones) {
  const errors = [];
  if (!milestones) {
    return { valid: false, errors: ['Milestones object is required'] };
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
    if (milestones[key] !== undefined) {
      const d = parseDate(milestones[key]);
      if (!d) {
        errors.push(`Invalid date format for '${key}'.`);
      } else {
        parsed[key] = d;
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
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

