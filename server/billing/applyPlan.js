/**
 * BILLING APPLY PLAN
 * Aplikowanie planów do sesji użytkownika
 */

function applyPlanToSession(session, planId) {
  if (!session) return;
  session.planId = planId;
  session.planAppliedAt = Date.now();
}

function getEffectivePlanId(session) {
  if (!session || !session.planId) return 'free';
  return session.planId;
}

module.exports = {
  applyPlanToSession,
  getEffectivePlanId
};
