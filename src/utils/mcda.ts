import type {
  CandidateProposal,
  McdaBreakdown,
} from '../interfaces/candidate.interface.js';

export interface McdaWeights {
  skills: number; // default 0.35
  budget: number; // default 0.25
  timeline: number; // default 0.20
  reputation: number; // default 0.20
}

export const DEFAULT_MCDA_WEIGHTS: McdaWeights = {
  skills: 0.35,
  budget: 0.25,
  timeline: 0.2,
  reputation: 0.2,
};

/**
 * Calcula el puntaje comparativo (0 a 100%) evaluando compatibilidad de habilidades,
 * ajuste al presupuesto, plazo de entrega y reputación del candidato.
 */
export function calculateCandidateMcda(
  proposal: CandidateProposal,
  projectBudget: number,
  projectSkills: string[],
  targetDays: number = 35,
  weights: McdaWeights = DEFAULT_MCDA_WEIGHTS
): McdaBreakdown {
  const normalizedProjectSkills = (projectSkills || []).map((s) =>
    s.trim().toLowerCase()
  );
  const candidateSkillsMap = new Map(
    (proposal.skills || []).map((s) => [s.trim().toLowerCase(), s])
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  projectSkills.forEach((reqSkill) => {
    const key = reqSkill.trim().toLowerCase();
    if (candidateSkillsMap.has(key)) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // 1. Compatibilidad de habilidades (0 - 100)
  const skillsRatio =
    normalizedProjectSkills.length > 0
      ? matchedSkills.length / normalizedProjectSkills.length
      : 1;
  const extraSkillsBonus = Math.min(
    8,
    Math.max(0, proposal.skills.length - matchedSkills.length) * 2
  );
  const skillsScore = Math.min(100, Math.round(skillsRatio * 94 + extraSkillsBonus));

  // 2. Competitividad de tarifa frente al presupuesto (0 - 100)
  let budgetScore = 85;
  if (projectBudget > 0) {
    const ratio = proposal.totalPrice / projectBudget;
    if (ratio <= 0.85) {
      budgetScore = 98;
    } else if (ratio <= 1.0) {
      // Entre 85% y 100% del presupuesto: de 98 a 86 pts
      budgetScore = Math.round(98 - ((ratio - 0.85) / 0.15) * 12);
    } else {
      // Si supera el presupuesto se penaliza gradualmente
      budgetScore = Math.max(40, Math.round(85 - (ratio - 1.0) * 120));
    }
  }

  // 3. Plazo de entrega estimado (0 - 100)
  const safeTargetDays = Math.max(7, targetDays);
  let timelineScore = 85;
  if (proposal.estimatedDays <= safeTargetDays * 0.8) {
    timelineScore = 96;
  } else if (proposal.estimatedDays <= safeTargetDays) {
    timelineScore = Math.round(
      96 -
        ((proposal.estimatedDays - safeTargetDays * 0.8) /
          (safeTargetDays * 0.2)) *
          12
    );
  } else {
    const extraDaysRatio =
      (proposal.estimatedDays - safeTargetDays) / safeTargetDays;
    timelineScore = Math.max(45, Math.round(84 - extraDaysRatio * 75));
  }

  // 4. Reputación y experiencia comprobada (0 - 100)
  const ratingScore = Math.min(5, Math.max(1, proposal.reputation)) * 18; // max 90
  const experienceBonus = Math.min(10, Math.round(proposal.completedProjects / 4));
  const reputationScore = Math.min(100, Math.round(ratingScore + experienceBonus));

  const weightedTotal =
    skillsScore * weights.skills +
    budgetScore * weights.budget +
    timelineScore * weights.timeline +
    reputationScore * weights.reputation;

  const totalScore = Math.min(100, Math.max(0, Math.round(weightedTotal)));

  return {
    totalScore,
    skillsScore,
    budgetScore,
    timelineScore,
    reputationScore,
    matchedSkills,
    missingSkills,
  };
}
