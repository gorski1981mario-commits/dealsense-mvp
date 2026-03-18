import CreditCardConfigurator from '../components/configurators/CreditCardConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function CreditCardPage() {
  return (
    <ConfiguratorGuard requiredPackage="finance" configuratorName="Creditcard Configurator">
      <CreditCardConfigurator packageType="finance" />
    </ConfiguratorGuard>
  )
}


