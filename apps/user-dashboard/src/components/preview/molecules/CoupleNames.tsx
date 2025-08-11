import React from 'react'

interface CoupleNamesProps {
  brideName: string
  groomName: string
}

export function CoupleNames({ brideName, groomName }: CoupleNamesProps) {
  return (
    <div className="text-center mb-8">
      <div className="space-y-2">
        <div className="text-2xl font-elegant text-gray-800 break-words">
          {brideName}
        </div>
        <div className="text-xl text-gray-600">&</div>
        <div className="text-2xl font-elegant text-gray-800 break-words">
          {groomName}
        </div>
      </div>
    </div>
  )
}
