import { useState } from 'react'

export function useModalState() {
  const [showShareModal, setShowShareModal] = useState(false)

  const showShare = () => setShowShareModal(true)
  const hideShare = () => setShowShareModal(false)

  return {
    showShareModal,
    showShare,
    hideShare
  }
}
