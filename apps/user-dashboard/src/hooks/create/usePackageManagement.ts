import { useState, useEffect } from 'react'
import { PackageType } from '@/services/supabaseService'
import { edgeFunctionsService, PackageStatus, PaymentConfirmation } from '@/services/edgeFunctionsService'

export function usePackageManagement() {
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('basic')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [packageStatus, setPackageStatus] = useState<PackageStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user's current package status
  useEffect(() => {
    loadPackageStatus()
  }, [])

  const loadPackageStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // For now, provide a fallback while we test the Edge Functions
      try {
        const status = await edgeFunctionsService.getPackageStatus()
        setPackageStatus(status)
        setSelectedPackage(status.package_type)
      } catch (edgeFunctionError) {
        console.warn('Edge Function not available, using fallback:', edgeFunctionError)
        
        // Fallback to basic package if Edge Functions are not available
        const fallbackStatus = {
          package_type: 'basic' as const,
          invitations_created: 0,
          invitations_limit: 1,
          can_create_more: true,
          features: ['basic_display', 'simple_sharing']
        }
        setPackageStatus(fallbackStatus)
        setSelectedPackage('basic')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load package status')
      console.error('Error loading package status:', err)
      
      // Still provide a fallback even if everything fails
      const fallbackStatus = {
        package_type: 'basic' as const,
        invitations_created: 0,
        invitations_limit: 1,
        can_create_more: true,
        features: ['basic_display', 'simple_sharing']
      }
      setPackageStatus(fallbackStatus)
      setSelectedPackage('basic')
    } finally {
      setIsLoading(false)
    }
  }

  const checkCanCreateInvitation = async (): Promise<boolean> => {
    try {
      const limits = await edgeFunctionsService.checkPackageLimits()
      return limits.canCreate
    } catch (err) {
      console.error('Error checking package limits:', err)
      return false
    }
  }

  const submitPaymentConfirmation = async (paymentData: PaymentConfirmation) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await edgeFunctionsService.submitPaymentConfirmation(paymentData)
      
      if (result.success) {
        // Optionally show success message or redirect
        return { success: true, confirmationId: result.confirmationId }
      } else {
        throw new Error('Payment confirmation failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit payment confirmation'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

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

  // Check if user can access a specific template
  const checkTemplateAccess = async (templateId: string): Promise<boolean> => {
    try {
      const result = await edgeFunctionsService.checkTemplateAccess(templateId)
      return result.hasAccess
    } catch (err) {
      console.error('Error checking template access:', err)
      return false
    }
  }

  // Get package information for upgrade modal
  const getPackageInfo = async () => {
    try {
      return await edgeFunctionsService.getPackageInfo()
    } catch (err) {
      console.error('Error getting package info:', err)
      return null
    }
  }

  return {
    // State
    selectedPackage,
    setSelectedPackage,
    showUpgradeModal,
    packageStatus,
    isLoading,
    error,
    
    // Package validation
    checkCanCreateInvitation,
    checkTemplateAccess,
    loadPackageStatus,
    
    // Payment & upgrade
    submitPaymentConfirmation,
    getPackageInfo,
    upgradeToGold,
    showUpgradeDialog,
    hideUpgradeDialog
  }
}
