import TelecomConfigurator from '../components/configurators/TelecomConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function TelecomPage() {
  return (
    <ConfiguratorGuard requiredPackage="pro" configuratorName="Telecom Configurator">
      <TelecomConfigurator packageType="pro" />
    </ConfiguratorGuard>
  )
}





