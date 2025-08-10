import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Lock, Check } from 'lucide-react'

interface PackageGateProps {
  userPackage: 'basic' | 'gold'
  requiredPackage: 'basic' | 'gold'
  templateName: string
  children: React.ReactNode
  onUpgradeClick?: () => void
  showUpgradeButton?: boolean
}

export function PackageGate({ 
  userPackage, 
  requiredPackage, 
  templateName, 
  children, 
  onUpgradeClick,
  showUpgradeButton = true 
}: PackageGateProps) {
  const hasAccess = userPackage === 'gold' || requiredPackage === 'basic'
  
  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred/disabled content */}
      <div className="pointer-events-none opacity-50 blur-sm">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
        <Card className="max-w-sm mx-4">
          <CardHeader className="text-center pb-3">
            <div className="flex justify-center mb-2">
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="text-lg">Premium Template</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                "{templateName}" requires a Gold package
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Current: Basic
                </Badge>
                <Badge variant="default" className="text-xs bg-yellow-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Requires: Gold
                </Badge>
              </div>
            </div>
            
            {showUpgradeButton && (
              <Button 
                onClick={onUpgradeClick}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Gold
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface PackageStatusDisplayProps {
  packageStatus: {
    package_type: 'basic' | 'gold'
    invitations_created: number
    invitations_limit: number | null
    can_create_more: boolean
  }
  className?: string
}

export function PackageStatusDisplay({ packageStatus, className = "" }: PackageStatusDisplayProps) {
  const { package_type, invitations_created, invitations_limit, can_create_more } = packageStatus
  
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {package_type === 'gold' ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-gray-400" />
            )}
            <div>
              <p className="font-medium capitalize">{package_type} Package</p>
              <p className="text-sm text-muted-foreground">
                {invitations_created} / {invitations_limit || '∞'} invitations used
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {can_create_more ? (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Can Create
              </Badge>
            ) : (
              <Badge variant="destructive">
                <Lock className="h-3 w-3 mr-1" />
                Limit Reached
              </Badge>
            )}
          </div>
        </div>
        
        {/* Progress bar for basic package */}
        {package_type === 'basic' && invitations_limit && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  can_create_more ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min((invitations_created / invitations_limit) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
