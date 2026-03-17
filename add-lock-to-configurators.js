// Helper script to add lock/unlock functionality to all configurators
// This adds the same pattern as EnergyConfigurator to all other configurators

const fs = require('fs');
const path = require('path');

const configurators = [
  { file: 'InsuranceConfigurator.tsx', sector: 'insurance', icon: '🛡️', name: 'Verzekering' },
  { file: 'TelecomConfigurator.tsx', sector: 'telecom', icon: '📱', name: 'Telecom' },
  { file: 'MortgageConfigurator.tsx', sector: 'mortgage', icon: '🏠', name: 'Hypotheek' },
  { file: 'LoanConfigurator.tsx', sector: 'loan', icon: '💰', name: 'Lening' },
  { file: 'LeasingConfigurator.tsx', sector: 'leasing', icon: '🚗', name: 'Leasing' },
  { file: 'CreditCardConfigurator.tsx', sector: 'creditcard', icon: '💳', name: 'Creditcard' },
  { file: 'VacationConfigurator.tsx', sector: 'vacation', icon: '✈️', name: 'Vakantie' }
];

const basePath = path.join(__dirname, 'app', 'components', 'configurators');

configurators.forEach(config => {
  const filePath = path.join(basePath, config.file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`Processing ${config.file}...`);
  
  // 1. Add imports
  if (!content.includes('Lock, Unlock, Download')) {
    content = content.replace(
      "import { useState } from 'react'",
      "import { useState } from 'react'\nimport { Lock, Unlock, Download } from 'lucide-react'"
    );
    content = content.replace(
      "import AgentEchoLogo from '../AgentEchoLogo'",
      "import AgentEchoLogo from '../AgentEchoLogo'\nimport { generateConfigurationPDF } from '../ConfigurationPDFGenerator'"
    );
  }
  
  // 2. Add lock state (after searching state)
  if (!content.includes('const [isLocked, setIsLocked]')) {
    content = content.replace(
      /const \[searching, setSearching\] = useState\(false\)/,
      `const [searching, setSearching] = useState(false)
  
  // Lock/unlock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)`
    );
  }
  
  // 3. Add lock/unlock/download handlers (after handleSubmit)
  if (!content.includes('handleLockConfiguration')) {
    const handlersCode = `

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      
      // Collect all state variables as parameters
      const stateVars = content.match(/const \\[(\\w+), set\\w+\\] = useState/g);
      const parameters = {};
      
      const configData = {
        userId: userId || 'anonymous',
        sector: '${config.sector}',
        parameters: {}, // Will be filled with actual state
        timestamp: new Date().toISOString()
      }

      const response = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      })

      const result = await response.json()
      
      if (result.success) {
        setConfigId(result.configId)
        setConfigTimestamp(configData.timestamp)
        setIsLocked(true)
        alert(\`✅ Configuratie vergrendeld!\\nConfiguration ID: \${result.configId}\`)
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('❌ Fout bij opslaan configuratie')
    } finally {
      setSaving(false)
    }
  }

  const handleUnlockConfiguration = () => {
    setIsLocked(false)
  }

  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return

    generateConfigurationPDF({
      configId,
      userId: userId || 'anonymous',
      sector: '${config.sector}',
      parameters: {}, // Will be filled with actual state
      timestamp: configTimestamp
    })
  }`;
    
    content = content.replace(
      /const handleSubmit = \(e: React\.FormEvent\) => {[\s\S]*?}\n/,
      match => match + handlersCode
    );
  }
  
  console.log(`✅ Updated ${config.file}`);
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('\n✅ All configurators updated!');
console.log('Note: You still need to manually:');
console.log('1. Add disabled={isLocked} to all input fields');
console.log('2. Add lock/unlock UI section');
console.log('3. Replace submit button with lock button when not locked');
