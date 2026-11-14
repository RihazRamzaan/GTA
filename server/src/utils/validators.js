// Shared request validation helpers.
export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
export const normalizeEmail = (value) => value.trim().toLowerCase();
export const isEmail = (value) => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
// bcrypt only uses the first 72 bytes, so longer passwords are rejected instead of cut short.
export const isValidPassword = (value) => typeof value === 'string' && value.length >= 8 && Buffer.byteLength(value) <= 72;
export const isContactNumber = (value) => typeof value === 'string' && /^[+]?[\d\s\-()]{7,25}$/.test(value.trim());
export const isUniversity = (value) => isNonEmptyString(value) && value.trim().length <= 150;
const isName = (value) => isNonEmptyString(value) && value.trim().length <= 100;
const membersMessage = 'Enter a name, valid email, and contact number for each member.';
const areValidRegistrationMembers = (members) =>
  Array.isArray(members) &&
  members.every((member) => isName(member?.name) && isEmail(member?.email) && isContactNumber(member?.contactNumber));
const areValidUpdateMembers = (members) =>
  Array.isArray(members) &&
  members.every(
    (member) =>
      isName(member?.name) &&
      isEmail(member?.email) &&
      (member?.contactNumber === undefined || member?.contactNumber === '' || isContactNumber(member?.contactNumber))
  );

// The leader is always the first member, whether or not the list included them.
function buildMembers(list, leaderName, leaderEmail, { minSize, maxSize, leaderContact = '' }) {
  const others = list.map((member) => ({
    name: member.name.trim(),
    email: normalizeEmail(member.email),
    contactNumber: typeof member.contactNumber === 'string' ? member.contactNumber.trim() : (member.contactNumber || ''),
  })).filter((member) => member.email !== leaderEmail);
  const members = [{ name: leaderName, email: leaderEmail, contactNumber: leaderContact }, ...others];

  if (new Set(members.map((member) => member.email)).size !== members.length) return { error: 'Each member needs a different email address.' };
  if (members.length < minSize || members.length > maxSize) return { error: `Teams must have ${minSize} to ${maxSize} members, including the leader.` };
  return { members };
}

// Returns { errors, value }. Only known fields are copied into value.
export function validateRegistration(body, { minSize, maxSize }) {
  const { email, password, team } = body ?? {};
  const errors = {};

  if (!isEmail(email)) errors.email = 'Enter a valid email address.';
  if (!isValidPassword(password)) errors.password = 'Password must be 8 to 72 characters.';
  if (!isName(team?.name)) errors.teamName = 'Enter a team name of up to 100 characters.';
  if (!isName(team?.leaderName)) errors.leaderName = "Enter the leader's name.";
  if (!isContactNumber(team?.contactNumber)) errors.contactNumber = 'Enter a valid contact number (7 to 25 digits).';
  if (!isUniversity(team?.university)) errors.university = 'Enter a university or institution name (up to 150 characters).';

  if (!areValidRegistrationMembers(team?.members ?? [])) errors.members = membersMessage;
  if (Object.keys(errors).length) return { errors };

  const leaderEmail = normalizeEmail(email);
  const leaderName = team.leaderName.trim();
  const leaderContact = team.contactNumber.trim();
  const { error, members } = buildMembers(team.members ?? [], leaderName, leaderEmail, { minSize, maxSize, leaderContact });
  if (error) errors.members = error;

  return {
    errors,
    value: {
      email: leaderEmail,
      password,
      team: {
        name: team.name.trim(),
        leaderName,
        leaderEmail,
        contactNumber: leaderContact,
        university: team.university.trim(),
        members,
      },
    },
  };
}

// Returns { errors, value } for PATCH /api/team/me. leaderEmail is the login email, so it never changes here.
export function validateTeamUpdate(body, team, { minSize, maxSize }) {
  const { teamName, leaderName, members, contactNumber, university } = body ?? {};
  const errors = {};

  if (teamName === undefined && leaderName === undefined && members === undefined && contactNumber === undefined && university === undefined) {
    return { errors: { form: 'Nothing to update.' } };
  }
  if (teamName !== undefined && !isName(teamName)) errors.teamName = 'Enter a team name of up to 100 characters.';
  if (leaderName !== undefined && !isName(leaderName)) errors.leaderName = "Enter the leader's name.";
  if (contactNumber !== undefined && !isContactNumber(contactNumber)) errors.contactNumber = 'Enter a valid contact number (7 to 25 digits).';
  if (university !== undefined && !isUniversity(university)) errors.university = 'Enter a university or institution name (up to 150 characters).';
  if (members !== undefined && !areValidUpdateMembers(members)) errors.members = membersMessage;
  if (Object.keys(errors).length) return { errors };

  const value = {};
  if (teamName !== undefined) value.name = teamName.trim();
  if (leaderName !== undefined) value.leaderName = leaderName.trim();
  if (contactNumber !== undefined) value.contactNumber = contactNumber.trim();
  if (university !== undefined) value.university = university.trim();
  if (leaderName !== undefined || members !== undefined || contactNumber !== undefined) {
    const leaderContact = value.contactNumber ?? team.contactNumber ?? '';
    const built = buildMembers(members ?? team.members, value.leaderName ?? team.leaderName, team.leaderEmail, { minSize, maxSize, leaderContact });
    if (built.error) errors.members = built.error;
    value.members = built.members;
  }
  return { errors, value };
}

// Returns { errors, value } for POST /api/team/payment
export function validatePaymentSubmission({ reference, date, file }) {
  const errors = {};

  if (!isNonEmptyString(reference)) {
    errors.reference = 'Enter the payment reference or transaction ID.';
  } else if (reference.trim().length < 3 || reference.trim().length > 100) {
    errors.reference = 'Reference must be between 3 and 100 characters.';
  }

  if (!isNonEmptyString(date) && !(date instanceof Date)) {
    errors.date = 'Enter the date of payment.';
  } else {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.date = 'Enter a valid payment date.';
    } else if (parsedDate.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
      errors.date = 'Payment date cannot be in the future.';
    }
  }

  if (!file) {
    errors.slip = 'Please upload a photo or PDF of your bank deposit slip.';
  }

  const value = {
    reference: typeof reference === 'string' ? reference.trim() : '',
    date: date ? new Date(date) : null,
  };

  return { errors, value };
}
