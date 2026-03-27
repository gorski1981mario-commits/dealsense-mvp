import InsuranceConfigurator from '../components/configurators/InsuranceConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function InsurancePage() {
  return (
    <ConfiguratorGuard requiredPackage="pro" configuratorName="Verzekeringen Configurator">
      <InsuranceConfigurator packageType="pro" />
    </ConfiguratorGuard>
  )
}





