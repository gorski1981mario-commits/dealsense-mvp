import EnergyConfigurator from '../components/configurators/EnergyConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function EnergyPage() {
  return (
    <ConfiguratorGuard requiredPackage="pro" configuratorName="Energie Configurator">
      <EnergyConfigurator packageType="pro" />
    </ConfiguratorGuard>
  )
}



