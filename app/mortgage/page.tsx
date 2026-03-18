import MortgageConfigurator from '../components/configurators/MortgageConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function MortgagePage() {
  return (
    <ConfiguratorGuard requiredPackage="finance" configuratorName="Hypotheek Configurator">
      <MortgageConfigurator packageType="finance" />
    </ConfiguratorGuard>
  )
}
