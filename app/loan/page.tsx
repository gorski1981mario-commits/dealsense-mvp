import LoanConfigurator from '../components/configurators/LoanConfigurator'
import ConfiguratorGuard from '../components/configurators/ConfiguratorGuard'

export default function LoanPage() {
  return (
    <ConfiguratorGuard requiredPackage="finance" configuratorName="Lening Configurator">
      <LoanConfigurator packageType="finance" />
    </ConfiguratorGuard>
  )
}



