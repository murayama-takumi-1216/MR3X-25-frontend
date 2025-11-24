'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { DollarSign, AlertCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { settingsAPI, agenciesAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function AgencySplitConfigPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Example amount for visualization
  const exampleAmount = 10000

  // Split fee configuration
  const [splitConfig, setSplitConfig] = useState({
    agencyFee: 8,
    ownerFee: 85,
    platformFee: 7,
  })

  // Load current settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        // Get platform fee from global settings
        const platformConfig = await settingsAPI.getPaymentConfig()
        
        // Get agency-specific fee (assuming we're viewing current user's agency)
        // For now, we'll get it from the global settings as default
        let agencyFeeValue = 8
        
        // If user is AGENCY_ADMIN and has agencyId, fetch their specific agency fee
        if (user?.role === 'AGENCY_ADMIN' && user?.agencyId) {
          try {
            const agencyData = await agenciesAPI.getAgencyById(user.agencyId)
            agencyFeeValue = agencyData.agencyFee || 8
          } catch (error) {
            console.warn('Could not load agency fee from agency, using default')
          }
        }
        
        setSplitConfig({
          agencyFee: agencyFeeValue,
          ownerFee: 100 - agencyFeeValue - (platformConfig.platformFee || 7),
          platformFee: platformConfig.platformFee || 7,
        })
      } catch (error) {
        console.error('Error loading payment config:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user?.role, user?.agencyId])

  // Calculate amounts based on split configuration
  const calculateAmounts = () => {
    const agencyAmount = (exampleAmount * splitConfig.agencyFee) / 100
    const ownerAmount = (exampleAmount * splitConfig.ownerFee) / 100
    const platformAmount = (exampleAmount * splitConfig.platformFee) / 100
    return { agencyAmount, ownerAmount, platformAmount }
  }

  const amounts = calculateAmounts()
  const totalFee = splitConfig.agencyFee + splitConfig.ownerFee + splitConfig.platformFee

  // Handle agency fee change
  const handleAgencyFeeChange = (value: number) => {
    const newAgencyFee = Math.max(0, Math.min(100, value))
    const newOwnerFee = 100 - newAgencyFee - splitConfig.platformFee

    if (newOwnerFee < 0) {
      toast.error(`Cannot set agency fee that high. Maximum is ${100 - splitConfig.platformFee}%`)
      return
    }

    setSplitConfig({
      ...splitConfig,
      agencyFee: newAgencyFee,
      ownerFee: newOwnerFee,
    })
  }

  // Save configuration
  const handleSave = async () => {
    if (totalFee !== 100) {
      toast.error(`Total must equal 100%. Current: ${totalFee}%`)
      return
    }

    // Validate agency fee
    if (splitConfig.agencyFee < 0 || splitConfig.agencyFee > 100) {
      toast.error('Agency fee must be between 0 and 100')
      return
    }

    setSaving(true)
    try {
      // Save agency fee to the agency endpoint (only for AGENCY_ADMIN)
      if (user?.role === 'AGENCY_ADMIN' && user?.agencyId) {
        console.log('Saving agency fee to agency:', {
          agencyId: user.agencyId,
          agencyFee: splitConfig.agencyFee,
        })
        
        await agenciesAPI.updateAgency(user.agencyId, {
          agencyFee: splitConfig.agencyFee,
        })
        
        console.log('Agency fee saved successfully')
        toast.success('Agency commission saved successfully!')
      } else {
        toast.error('You must be an agency admin to save commission settings')
      }
    } catch (error: any) {
      console.error('Error saving agency fee:', error)
      const errorMessage = error?.data?.message || error?.message || 'Failed to save configuration'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Agency Split Payment Configuration</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Configure your agency's commission percentage from rental payments
        </p>
      </div>

      {/* Information Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How Split Payments Work</p>
              <p>
                When a tenant makes a payment, it is automatically divided according to the configured percentages.
                You can adjust your agency's commission. The platform fee is set by the CEO.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Configuration</CardTitle>
          <CardDescription>
            Manage your agency's commission from rental payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agency Fee - Editable */}
          <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Label htmlFor="agency-fee" className="text-base font-semibold text-green-900">
              Your Agency Commission (%) - Editable
            </Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Slider
                  id="agency-fee"
                  min={0}
                  max={100 - splitConfig.platformFee}
                  step={0.5}
                  value={[splitConfig.agencyFee]}
                  onValueChange={(value) => handleAgencyFeeChange(value[0])}
                  className="cursor-pointer"
                />
              </div>
              <Input
                type="number"
                min={0}
                max={100 - splitConfig.platformFee}
                step={0.5}
                value={splitConfig.agencyFee}
                onChange={(e) => handleAgencyFeeChange(parseFloat(e.target.value) || 0)}
                className="w-20 text-right"
              />
              <span className="text-sm font-medium w-16">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(amounts.agencyAmount)}
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2">
              ✓ You can adjust this value to set your commission percentage
            </p>
          </div>

          {/* Owner Fee - Read Only */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Label className="text-base font-semibold text-gray-900">
              Owner Payment (%) - Calculated
            </Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  value={splitConfig.ownerFee}
                  disabled
                  className="bg-white cursor-not-allowed"
                />
              </div>
              <span className="text-sm font-medium w-16">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(amounts.ownerAmount)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Automatically calculated: 100% - Your Commission - Platform Fee
            </p>
          </div>

          {/* Platform Fee - Read Only (Set by CEO) */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              <Label className="text-base font-semibold text-gray-900">
                Platform Fee (%) - Set by CEO
              </Label>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  value={splitConfig.platformFee}
                  disabled
                  className="bg-white cursor-not-allowed"
                />
              </div>
              <span className="text-sm font-medium w-16">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(amounts.platformAmount)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              This is set by the platform CEO and cannot be changed at the agency level
            </p>
          </div>

          {/* Total Indicator */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Percentage</span>
              <span className="text-lg font-bold text-green-600">
                {totalFee}%
              </span>
            </div>
          </div>

          {/* Visual Split Bar */}
          <div className="space-y-2 pt-4">
            <Label className="text-sm font-medium">Visual Representation (Example: R$10,000 payment)</Label>
            <div className="flex h-12 rounded-lg overflow-hidden border-2 border-gray-200">
              <div
                className="bg-orange-500 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${splitConfig.agencyFee}%` }}
                title={`Your Agency: ${splitConfig.agencyFee}%`}
              >
                {splitConfig.agencyFee > 8 && `${splitConfig.agencyFee}%`}
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${splitConfig.ownerFee}%` }}
                title={`Owner: ${splitConfig.ownerFee}%`}
              >
                {splitConfig.ownerFee > 8 && `${splitConfig.ownerFee}%`}
              </div>
              <div
                className="bg-purple-500 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${splitConfig.platformFee}%` }}
                title={`Platform: ${splitConfig.platformFee}%`}
              >
                {splitConfig.platformFee > 8 && `${splitConfig.platformFee}%`}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Your Agency (R${amounts.agencyAmount.toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Owner (R${amounts.ownerAmount.toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Platform (R${amounts.platformAmount.toFixed(2)})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90"
        >
          {saving ? 'Saving...' : 'Save Agency Commission'}
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle className="text-base">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Your Commission:</span> {splitConfig.agencyFee}% of each payment
          </p>
          <p>
            <span className="font-semibold">Owner Payment:</span> {splitConfig.ownerFee}% of each payment
          </p>
          <p>
            <span className="font-semibold">Platform Commission:</span> {splitConfig.platformFee}% of each payment (set by CEO)
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            These settings apply to all rental payments processed through your agency
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
