import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Tag, Layout } from 'lucide-react'

interface DraftInfo {
  hasFormData: boolean
  category: string | null
  template: string | null
  step: number
  lastSaved: string
  isRecent: boolean
}

interface DraftRecoveryModalProps {
  isOpen: boolean
  draftInfo: DraftInfo | null
  onRestore: () => void
  onDiscard: () => void
}

/**
 * Modal component for draft recovery notification
 * Shows users when previous work can be restored
 */
export function DraftRecoveryModal({ 
  isOpen, 
  draftInfo, 
  onRestore, 
  onDiscard 
}: DraftRecoveryModalProps) {
  if (!draftInfo) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Previous Work Found
          </DialogTitle>
          <DialogDescription>
            We found your unsaved invitation work from a previous session. 
            You can continue where you left off, or start fresh with a completely clean form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last saved: {draftInfo.lastSaved}</span>
            </div>
            
            {draftInfo.category && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                <span>Category: {draftInfo.category}</span>
              </div>
            )}
            
            {draftInfo.template && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Layout className="w-4 h-4" />
                <span>Template selected</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Progress: Step {draftInfo.step} of 4</span>
            </div>
            
            {draftInfo.hasFormData && (
              <div className="text-sm text-green-600 font-medium">
                ✓ Form data saved
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onDiscard}
            className="flex-1"
            title="Clear all saved data and start with a blank form"
          >
            Start Fresh
          </Button>
          <Button 
            onClick={onRestore}
            className="flex-1"
          >
            Continue Previous Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
