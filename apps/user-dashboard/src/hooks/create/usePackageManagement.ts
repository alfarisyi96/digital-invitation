import { useState } from 'react'
import { PackageType } from '@/services/supabaseService'

export function usePackageManagement() {
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('basic')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const upgradeToGold = () => {
    setSelectedPackage('gold')
    setShowUpgradeModal(false)
  }

  const showUpgradeDialog = () => {
    setShowUpgradeModal(true)
  }

  const hideUpgradeDialog = () => {
    setShowUpgradeModal(false)
  }

  return {
    selectedPackage,
    setSelectedPackage,
    showUpgradeModal,
    upgradeToGold,
    showUpgradeDialog,
    hideUpgradeDialog
  }
}
