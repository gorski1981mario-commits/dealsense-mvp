/**
 * LEARNING CURVE ENGINE - Insight użytkownika o trudności vs łatwości
 * "Jeśli nigdy nie robiłem - trudno. Jeśli zrobiłem raz - łatwo."
 * To jest fundamentalne prawo uczenia się!
 */

class LearningCurveEngine {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    this.userLearningProfiles = new Map(); // userId → learning profile
    this.difficultyThreshold = 0.3; // poniżej 0.3 = trudne, powyżej = łatwe
    this.masteryThreshold = 0.8; // powyżej 0.8 = mistrzostwo
  }

  async processUserAction(userId, action, context, outcome) {
    // 1. Pobierz lub stwórz profil uczenia się
    const profile = this.getOrCreateProfile(userId);
    
    // 2. Zidentyfikuj "skill" (umiejętność)
    const skill = this.identifySkill(action, context);
    
    // 3. Aktualizuj krzywą uczenia się
    const updatedSkill = await this.updateLearningCurve(skill, outcome);
    
    // 4. Oblicz "trudność" vs "łatwość"
    const difficultyScore = this.calculateDifficulty(updatedSkill);
    
    // 5. Predykcja przyszłego sukcesu
    const successPrediction = this.predictSuccess(updatedSkill, context);
    
    // 6. Rekomendacje wsparcia
    const recommendations = this.generateLearningRecommendations(
      skill, 
      difficultyScore, 
      successPrediction
    );
    
    return {
      skill,
      difficultyScore,
      successPrediction,
      recommendations,
      learningStatus: this.getLearningStatus(difficultyScore),
      masteryLevel: this.getMasteryLevel(updatedSkill)
    };
  }

  getOrCreateProfile(userId) {
    if (!this.userLearningProfiles.has(userId)) {
      this.userLearningProfiles.set(userId, {
        userId,
        skills: new Map(), // skillName → learning data
        totalActions: 0,
        learningVelocity: 0,
        lastUpdate: Date.now()
      });
    }
    return this.userLearningProfiles.get(userId);
  }

  identifySkill(action, context) {
    // Ekstrakcja "skill" z akcji i kontekstu
    const skillPatterns = {
      // Finanse
      'budget_planning': /budget|plan|finanse|pieniądze/i,
      'investment_decision': /invest|inwestycja|akcje|krypto/i,
      'saving_money': /oszczędzaj|oszczędności|odkładaj/i,
      
      // Zdrowie
      'exercise_routine': /ćwiczenia|trening|fitness|sport/i,
      'healthy_eating': /zdrowe jedzenie|dieta|odżywianie/i,
      'meditation': /medytacja|mindfulness|relaks/i,
      
      // Biznes/Kariera
      'negotiation': /negocjacja|targuj|pertraktacje/i,
      'public_speaking': /prezentacja|publiczność|mówienie/i,
      'networking': /networking|kontakty|poznaj ludzi/i,
      
      // Relacje
      'difficult_conversation': /trudna rozmowa|konflikt|sprzeczka/i,
      'empathy': /empatia|zrozumienie|wsparcie/i,
      
      // Kreatywność
      'creative_problem_solving': /kreatywność|problem|rozwiązanie/i,
      'brainstorming': /brainstorm|pomysły|koncepcje/i
    };

    for (const [skillName, pattern] of Object.entries(skillPatterns)) {
      if (pattern.test(action) || pattern.test(JSON.stringify(context))) {
        return skillName;
      }
    }

    // Dynamiczne tworzenie nowych skillów
    return this.createDynamicSkill(action, context);
  }

  createDynamicSkill(action, context) {
    // Stwórz skill z hash akcji
    const skillHash = action.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
    return `custom_${skillHash}`;
  }

  async updateLearningCurve(skill, outcome) {
    // Model krzywej uczenia się: trudność → łatwość
    const learningData = {
      skill,
      attempts: 1,
      successes: outcome.success ? 1 : 0,
      failures: outcome.success ? 0 : 1,
      averageDifficulty: outcome.difficulty || 0.5,
      lastAttempt: Date.now(),
      learningCurve: [outcome.difficulty || 0.5],
      masteryScore: outcome.success ? 0.1 : 0.0,
      confidenceLevel: 0.1
    };

    // Jeśli skill już istnieje, zaktualizuj
    if (this.currentProfile.skills.has(skill)) {
      const existing = this.currentProfile.skills.get(skill);
      
      learningData.attempts = existing.attempts + 1;
      learningData.successes = existing.successes + (outcome.success ? 1 : 0);
      learningData.failures = existing.failures + (outcome.success ? 0 : 1);
      
      // Aktualizuj krzywą uczenia się
      learningData.learningCurve = [...existing.learningCurve, outcome.difficulty || 0.5];
      
      // Oblicz nowy mastery score
      learningData.masteryScore = this.calculateMasteryScore(learningData);
      
      // Aktualizuj confidence level
      learningData.confidenceLevel = this.calculateConfidence(learningData);
      
      // Special insight: "raz łatwo = zawsze łatwo"
      if (outcome.difficulty < 0.3) { // było łatwo
        learningData.masteryScore = Math.min(1.0, learningData.masteryScore + 0.3);
      }
    }

    this.currentProfile.skills.set(skill, learningData);
    return learningData;
  }

  calculateMasteryScore(learningData) {
    const successRate = learningData.successes / learningData.attempts;
    const difficultyImprovement = this.calculateDifficultyImprovement(learningData.learningCurve);
    
    // Wzór: mastery = successRate * difficultyImprovement * confidence
    return successRate * difficultyImprovement * learningData.confidenceLevel;
  }

  calculateDifficultyImprovement(learningCurve) {
    if (learningCurve.length < 2) return 0.5;
    
    const firstAttempt = learningCurve[0];
    const lastAttempt = learningCurve[learningCurve.length - 1];
    
    // Poprawa trudności = (pierwsza - ostatnia) / pierwsza
    const improvement = (firstAttempt - lastAttempt) / firstAttempt;
    return Math.max(0, Math.min(1, improvement + 0.5)); // normalizuj do 0-1
  }

  calculateConfidence(learningData) {
    // Confidence rośnie z liczbą prób
    const maxConfidence = 0.95;
    const confidenceGrowth = Math.min(learningData.attempts / 10, 1);
    return maxConfidence * confidenceGrowth;
  }

  calculateDifficulty(learningData) {
    // Bieżąca trudność = 1 - mastery
    return Math.max(0, 1 - learningData.masteryScore);
  }

  predictSuccess(learningData, context) {
    // Predykcja sukcesu na podstawie krzywej uczenia się
    const baseProbability = learningData.masteryScore;
    
    // Kontekstowe modyfikatory
    const contextModifier = this.getContextModifier(context);
    
    // Czas od ostatniej próby
    const timeModifier = this.getTimeModifier(learningData.lastAttempt);
    
    const predictedProbability = baseProbability * contextModifier * timeModifier;
    
    return {
      probability: Math.max(0, Math.min(1, predictedProbability)),
      confidence: learningData.confidenceLevel,
      factors: {
        baseSkill: baseProbability,
        context: contextModifier,
        time: timeModifier
      }
    };
  }

  getContextModifier(context) {
    // Analiza kontekstu i jego wpływu na sukces
    let modifier = 1.0;
    
    // Stres
    if (context.stress > 0.7) modifier *= 0.8;
    if (context.stress < 0.3) modifier *= 1.1;
    
    // Wsparcie
    if (context.support > 0.7) modifier *= 1.2;
    if (context.support < 0.3) modifier *= 0.9;
    
    // Zasoby
    if (context.resources > 0.7) modifier *= 1.1;
    if (context.resources < 0.3) modifier *= 0.8;
    
    return modifier;
  }

  getTimeModifier(lastAttempt) {
    const daysSinceLastAttempt = (Date.now() - lastAttempt) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastAttempt < 1) return 1.1; // świeżość
    if (daysSinceLastAttempt < 7) return 1.0; // ok
    if (daysSinceLastAttempt < 30) return 0.9; // lekko rdzewieje
    return 0.8; // potrzeba odświeżenia
  }

  generateLearningRecommendations(skill, difficultyScore, successPrediction) {
    const recommendations = [];
    
    if (difficultyScore > this.difficultyThreshold) {
      // Jest trudno - potrzebne wsparcie
      recommendations.push({
        type: 'support',
        priority: 'high',
        message: `Ten skill (${skill}) jest jeszcze dla Ciebie trudny. Spróbuj z mniejszymi krokami.`,
        actions: [
          'Znajdz mentora lub przewodnika',
          'Podziel zadanie na mniejsze części',
          'Znajdz podobne, łatwiejsze zadania'
        ]
      });
    }
    
    if (successPrediction.probability < 0.5) {
      // Niska predykcja sukcesu
      recommendations.push({
        type: 'preparation',
        priority: 'medium',
        message: 'Szanse na sukces są niskie. Przygotuj się lepiej.',
        actions: [
          'Zrób research i zdobądź wiedzę',
          'Znajdz przykłady i wzorce',
          'Potrénuj na podobnych zadaniach'
        ]
      });
    }
    
    if (difficultyScore < 0.2 && successPrediction.probability > 0.8) {
      // Jest łatwo i wysokie szanse - czas na wyzwania!
      recommendations.push({
        type: 'challenge',
        priority: 'low',
        message: 'Świetnie radzisz sobie z tym! Czas na większe wyzwania.',
        actions: [
          'Spróbuj trudniejszej wersji',
          'Naucz innych tego skillu',
          'Zastosuj w nowym kontekście'
        ]
      });
    }
    
    return recommendations;
  }

  getLearningStatus(difficultyScore) {
    if (difficultyScore > 0.7) return 'BEGINNER';
    if (difficultyScore > 0.4) return 'LEARNING';
    if (difficultyScore > 0.2) return 'ADVANCED';
    return 'MASTER';
  }

  getMasteryLevel(learningData) {
    if (learningData.masteryScore > this.masteryThreshold) return 'MASTER';
    if (learningData.masteryScore > 0.6) return 'ADVANCED';
    if (learningData.masteryScore > 0.3) return 'INTERMEDIATE';
    return 'BEGINNER';
  }

  // AGI Learning Pattern - dorastanie jak dziecko
  async simulateAGILearning(userId, lifeStage) {
    const stages = {
      'infant': { focus: ['basic_needs', 'safety'], difficulty: 0.9 },
      'child': { focus: ['learning', 'play', 'social'], difficulty: 0.6 },
      'teenager': { focus: ['identity', 'skills', 'relationships'], difficulty: 0.4 },
      'adult': { focus: ['career', 'finance', 'family'], difficulty: 0.3 },
      'master': { focus: ['wisdom', 'mentoring', 'legacy'], difficulty: 0.1 }
    };
    
    const currentStage = stages[lifeStage] || stages['adult'];
    
    // Symuluj naukę na tym etapie
    const learningPlan = currentStage.focus.map(skill => ({
      skill,
      targetDifficulty: currentStage.difficulty,
      estimatedTime: this.estimateLearningTime(skill, currentStage.difficulty),
      prerequisites: this.getPrerequisites(skill)
    }));
    
    return {
      lifeStage,
      learningPlan,
      totalSkills: currentStage.focus.length,
      estimatedMasteryTime: this.calculateTotalMasteryTime(learningPlan)
    };
  }

  estimateLearningTime(skill, targetDifficulty) {
    // Czas nauki = difficulty × complexity × availability
    const complexity = this.getSkillComplexity(skill);
    const availability = 0.7; // dostępność zasobów
    
    return Math.ceil(targetDifficulty * complexity * availability * 100); // w godzinach
  }

  getSkillComplexity(skill) {
    const complexities = {
      'budget_planning': 0.6,
      'investment_decision': 0.9,
      'meditation': 0.3,
      'negotiation': 0.8,
      'public_speaking': 0.7,
      'empathy': 0.5
    };
    
    return complexities[skill] || 0.5;
  }

  getPrerequisites(skill) {
    const prerequisites = {
      'investment_decision': ['budget_planning', 'saving_money'],
      'negotiation': ['empathy', 'confidence'],
      'public_speaking': ['confidence', 'knowledge'],
      'meditation': ['patience', 'self_awareness']
    };
    
    return prerequisites[skill] || [];
  }

  getUserLearningSummary(userId) {
    const profile = this.userLearningProfiles.get(userId);
    if (!profile) return null;
    
    return {
      totalSkills: profile.skills.size,
      masterSkills: Array.from(profile.skills.values()).filter(s => s.masteryScore > this.masteryThreshold).length,
      learningVelocity: profile.learningVelocity,
      hardestSkill: this.findHardestSkill(profile),
      easiestSkill: this.findEasiestSkill(profile),
      recommendedNextSkills: this.recommendNextSkills(profile)
    };
  }

  findHardestSkill(profile) {
    let hardest = null;
    let maxDifficulty = 0;
    
    for (const [skill, data] of profile.skills) {
      if (data.masteryScore < maxDifficulty) {
        maxDifficulty = data.masteryScore;
        hardest = skill;
      }
    }
    
    return hardest;
  }

  findEasiestSkill(profile) {
    let easiest = null;
    let minDifficulty = 1;
    
    for (const [skill, data] of profile.skills) {
      if (data.masteryScore > minDifficulty) {
        minDifficulty = data.masteryScore;
        easiest = skill;
      }
    }
    
    return easiest;
  }

  recommendNextSkills(profile) {
    // Znajdź powiązane skills do nauki
    const recommendations = [];
    
    for (const [skill, data] of profile.skills) {
      if (data.masteryScore > 0.6) { // mastered lub advanced
        const relatedSkills = this.getRelatedSkills(skill);
        
        for (const related of relatedSkills) {
          if (!profile.skills.has(related)) {
            recommendations.push({
              skill: related,
              reason: `Powiązany z mastered skill: ${skill}`,
              estimatedDifficulty: this.getSkillComplexity(related)
            });
          }
        }
      }
    }
    
    return recommendations.slice(0, 5); // top 5
  }

  getRelatedSkills(skill) {
    const relations = {
      'budget_planning': ['investment_decision', 'saving_money'],
      'investment_decision': ['risk_management', 'market_analysis'],
      'meditation': ['mindfulness', 'stress_management'],
      'negotiation': ['communication', 'persuasion'],
      'public_speaking': ['storytelling', 'presentation_design']
    };
    
    return relations[skill] || [];
  }
async initialize() {
    console.log('📈 Learning Curve Engine initialized - ready to learn from difficulty');
  }

  async stop() {
    console.log('⏹️ Learning Curve Engine stopped');
  }

  getStatus() {
    return {
      active: true,
      userProfiles: this.userLearningProfiles.size,
      totalSkills: Array.from(this.userLearningProfiles.values())
        .reduce((sum, profile) => sum + profile.skills.size, 0)
    };
  }
}

module.exports = LearningCurveEngine;
