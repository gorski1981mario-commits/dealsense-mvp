import LeasingConfigurator from '../components/configurators/LeasingConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function LeasingPage() {
  return (
    <ConfiguratorGuard requiredPackage="finance" configuratorName="Leasing Configurator">
      <LeasingConfigurator packageType="finance" />
    </ConfiguratorGuard>
  )
}


