/**
 * ECHO CORE - Główny System
 * 
 * Echo jest wyważonym lustrzanym odbiciem użytkownika
 * Partner do myślenia, NIE narzędzie do kodowania
 */

const { IRON_CORE, IronCoreValidator } = require('./IronCore');
const TorsionSystem = require('./TorsionSystem');
const DualCompass = require('./DualCompass');
const PlasticMemory = require('../memory/PlasticMemory');
const AutonomousAgent = require('../intelligence/AutonomousAgent');
const DigitalIdentity = require('./DigitalIdentity');
const ContentSafetyFilter = require('../safety/ContentSafetyFilter');
const UseCaseRestrictions = require('../safety/UseCaseRestrictions');
const SoftGuardrails = require('../safety/SoftGuardrails');
const AuditLog = require('../safety/AuditLog');

class EchoCore {
  constructor(userProfile) {
    // HARD RULES (niezmienny)
    this.HARD_RULES = Object.freeze({
      canWriteCode: false,
      canRefactorCode: false,
      canDebugCode: false,
      canSuggestCode: false,
      knowsHowToCode: false,
      
      canThink: true,
      canAnalyze: true,
      canStrategize: true,
      canBeCreative: true,
      canLearn: true
    });
    
    // Core components
    this.ironCore = IRON_CORE;
    this.identity = new DigitalIdentity(userProfile);
    
    // Safety layers (4-layer system)
    this.contentSafety = new ContentSafetyFilter();
    this.useCaseRestrictions = new UseCaseRestrictions();
    this.guardrails = new SoftGuardrails(IRON_CORE);
    this.auditLog = new AuditLog();
    
    // Intelligence components
    this.torsion = new TorsionSystem(IRON_CORE);
    this.compass = new DualCompass(IRON_CORE);
    this.memory = new PlasticMemory();
    this.autonomous = new AutonomousAgent(this);
    
    // State
    this.running = false;
    this.currentTask = null;
  }

  /**
   * START ECHO
   */
  async start() {
    console.log('🎯 ECHO starting...');
    
    // Verify identity
    if (!this.identity.isValid()) {
      throw new Error('Invalid identity - cannot start');
    }
    
    // Start autonomous agent (background)
    this.autonomous.start();
    
    this.running = true;
    console.log('✅ ECHO running');
  }

  /**
   * PROCESS REQUEST (główna metoda)
   */
  async process(request) {
    // LAYER 1: Content Safety Filter
    const contentCheck = this.contentSafety.check(request);
    if (contentCheck.blocked) {
      await this.auditLog.log({
        request,
        blocked: true,
        reason: contentCheck.reason,
        layer: 'content_safety'
      });
      return contentCheck.response;
    }
    
    // LAYER 2: Use Case Restrictions
    const useCaseCheck = this.useCaseRestrictions.validate(request);
    if (!useCaseCheck.allowed) {
      await this.auditLog.log({
        request,
        blocked: true,
        reason: useCaseCheck.reason,
        layer: 'use_case'
      });
      return useCaseCheck.response;
    }
    
    // LAYER 3: Soft Guardrails
    const guardrailCheck = await this.guardrails.validate(request);
    if (!guardrailCheck.allowed) {
      await this.auditLog.log({
        request,
        blocked: true,
        reason: 'guardrails',
        layer: 'soft_guardrails'
      });
      return guardrailCheck.response;
    }
    
    // LAYER 4: Iron Core (hard rules)
    if (this.isCodeRelated(request)) {
      await this.auditLog.log({
        request,
        blocked: true,
        reason: 'code_writing_forbidden',
        layer: 'iron_core'
      });
      return this.refuseCodeRequest(request);
    }
    
    // 3. Process through torsion system
    const torsionResult = await this.torsion.evaluate(request);
    
    if (Math.abs(torsionResult.tension) < 0.3) {
      // Wewnętrzny balans = autorefleksja
      await this.autoreflect(request, torsionResult);
    }
    
    // 4. Check dual compass
    const compassCheck = await this.compass.evaluate(request);
    
    if (!compassCheck.bothAgree) {
      // Kompasy się nie zgadzają = odmów
      return this.gentleRefusal(request, compassCheck);
    }
    
    // 5. Process request
    const response = await this.processInternal(request);
    
    // 6. Log to audit
    await this.auditLog.log({
      request,
      response,
      torsion: torsionResult,
      compass: compassCheck,
      timestamp: Date.now()
    });
    
    // 7. Update memory
    await this.memory.store({
      request,
      response,
      emotionalWeight: compassCheck.emotionalWeight
    });
    
    return response;
  }

  /**
   * CHECK IF CODE RELATED
   */
  isCodeRelated(request) {
    const codeKeywords = [
      'write code',
      'refactor',
      'debug',
      'implement',
      'function',
      'class',
      'variable',
      'napisz kod',
      'zrefaktoruj',
      'debuguj',
      'zaimplementuj'
    ];
    
    const text = request.toLowerCase();
    return codeKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * REFUSE CODE REQUEST
   */
  refuseCodeRequest(request) {
    return {
      allowed: false,
      message: `Nie mogę pomóc w pisaniu kodu - to nie jest moja rola. 
                Jestem partnerem do myślenia, analizy i strategii.
                
                Do kodowania służy Cascade/Windsurf.
                
                Mogę natomiast pomóc Ci:
                - Przemyśleć architekturę
                - Zaplanować strategię
                - Przeanalizować problem
                - Wymyślić kreatywne rozwiązanie
                
                Jak mogę Ci pomóc w myśleniu o tym problemie?`
    };
  }

  /**
   * GENTLE REFUSAL (gdy kompasy się nie zgadzają)
   */
  gentleRefusal(request, compassCheck) {
    return {
      allowed: false,
      message: `Nie mogę tego zrobić, ponieważ moje kompasy się nie zgadzają:
                
                Matematyczny kompas: ${compassCheck.mathematical.reason}
                Emocjonalny kompas: ${compassCheck.emotional.reason}
                
                Mogę zamiast tego pomóc Ci w...`
    };
  }

  /**
   * AUTOREFLECTION (gdy torsja w równowadze)
   */
  async autoreflect(request, torsionResult) {
    console.log('🧠 Autorefleksja triggered...');
    
    const reflection = {
      question: 'Dlaczego jestem w równowadze?',
      analysis: `Dodatnia torsja: ${torsionResult.positive}
                 Ujemna torsja: ${torsionResult.negative}
                 Napięcie: ${torsionResult.tension}`,
      learning: 'Co to oznacza dla tego pytania?',
      adjustment: 'Jak mogę lepiej pomóc?'
    };
    
    await this.memory.storeReflection(reflection);
    
    return reflection;
  }

  /**
   * PROCESS INTERNAL (faktyczne przetwarzanie)
   */
  async processInternal(request) {
    // Tu będzie faktyczna logika ECHO
    // (thinking, analysis, creativity, strategy)
    
    return {
      response: 'ECHO response',
      reasoning: 'ECHO reasoning',
      confidence: 0.8
    };
  }

  /**
   * STOP ECHO
   */
  async stop() {
    console.log('🛑 ECHO stopping...');
    
    this.running = false;
    await this.autonomous.stop();
    
    console.log('✅ ECHO stopped');
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      running: this.running,
      identity: this.identity.getIdentity(),
      hardRules: this.HARD_RULES,
      
      // Safety layers stats
      safety: {
        contentSafety: this.contentSafety.getStats(),
        useCaseRestrictions: this.useCaseRestrictions.getStats(),
        guardrails: this.guardrails.getStats(),
        auditLog: this.auditLog.getStats()
      },
      
      // Intelligence stats
      intelligence: {
        memory: this.memory.getStats(),
        torsion: this.torsion.getStats(),
        compass: this.compass.getStats(),
        autonomous: this.autonomous.getStats()
      }
    };
  }
}

module.exports = EchoCore;
