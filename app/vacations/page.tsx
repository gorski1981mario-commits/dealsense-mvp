import VacationConfigurator from '../components/configurators/VacationConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function VacationsPage() {
  return (
    <ConfiguratorGuard requiredPackage="pro" configuratorName="Vakanties Configurator">
      <VacationConfigurator packageType="pro" />
    </ConfiguratorGuard>
  )
}





