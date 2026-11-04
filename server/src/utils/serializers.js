// Shapes sent to the browser. Never add passwordHash or payment.slipKey here.
export const publicUser = (user) => ({ id: user.id, email: user.email, role: user.role, teamId: user.teamId });

export const publicTeam = (team) => team && ({ id: team.id, name: team.name, leaderName: team.leaderName, leaderEmail: team.leaderEmail, members: team.members.map(({ name, email }) => ({ name, email })) });

export function publicRegistration(registration) {
  if (!registration) return registration;
  const { reference, date, submittedAt, reviewedAt, rejectionReason } = registration.payment ?? {};
  return { id: registration.id, status: registration.status, feeAmount: registration.feeAmount, payment: { reference, date, submittedAt, reviewedAt, rejectionReason } };
}
