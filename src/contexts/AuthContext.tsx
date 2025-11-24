'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'

export interface User {
  id: string
  email: string
  role: string
  plan: string
  name?: string
  agencyId?: string
  brokerId?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  register: (data: any) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  CEO: 10,
  ADMIN: 9,
  AGENCY_ADMIN: 8,
  AGENCY_MANAGER: 7,
  BROKER: 6,
  INDEPENDENT_OWNER: 5.5, // Between BROKER and PROPRIETARIO
  PROPRIETARIO: 5,
  INQUILINO: 4,
  BUILDING_MANAGER: 3,
  LEGAL_AUDITOR: 2,
  REPRESENTATIVE: 1,
  API_CLIENT: 0,
}

// Permission matrix for all 8 roles
const ROLE_PERMISSIONS = {
  CEO: [
    'dashboard:read',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'agencies:read', 'agencies:create', 'agencies:update', 'agencies:delete',
    'properties:read', 'properties:create', 'properties:update', 'properties:delete',
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete',
    'payments:read', 'payments:create', 'payments:update', 'payments:delete',
    'reports:read', 'reports:create', 'reports:export',
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'audit:read', 'audit:create',
    'settings:read', 'settings:update',
    'billing:read', 'billing:update',
    'integrations:read', 'integrations:create', 'integrations:update', 'integrations:delete',
  ],
  ADMIN: [
    'dashboard:read',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'agencies:read', 'agencies:create', 'agencies:update', 'agencies:delete',
    'properties:read', 'properties:create', 'properties:update', 'properties:delete',
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete',
    'payments:read', 'payments:create', 'payments:update', 'payments:delete',
    'reports:read', 'reports:create', 'reports:export',
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'audit:read', 'audit:create',
    'documents:read', 'documents:create',
    'settings:read', 'settings:update',
    'billing:read', 'billing:update',
    'integrations:read', 'integrations:create', 'integrations:update', 'integrations:delete',
  ],
  AGENCY_ADMIN: [
    'dashboard:read',
    'users:read', 'users:create', 'users:update', 'users:delete', // Can manage all agency users (managers, brokers)
    'agencies:read', 'agencies:update', // Can update their agency settings
    'properties:read', 'properties:create', 'properties:update', 'properties:delete', // Full agency portfolio visibility
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete', 'contracts:approve',
    'payments:read', 'payments:create', 'payments:update', 'payments:delete', 'payments:approve',
    'reports:read', 'reports:create', 'reports:export', // Agency-wide reports and KPIs
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'audit:read', // Can view agency audit logs
    'documents:read', 'documents:create',
    'settings:read', 'settings:update', // Agency settings (commissions, plans, integrations)
    'billing:read', 'billing:update', // Agency billing and payouts
    'integrations:read', 'integrations:update', // Agency integrations (Asaas, ZapSign, etc.)
  ],
  AGENCY_MANAGER: [
    'dashboard:read',
    'users:read', 'users:create', 'users:update', 'users:delete', // Only within agency
    'agencies:read', 'agencies:update', // Own agency only
    'properties:read', 'properties:create', 'properties:update', 'properties:delete', // Agency properties
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete', // Agency contracts
    'payments:read', 'payments:create', 'payments:update', 'payments:delete', // Agency payments
    'reports:read', 'reports:create', 'reports:export', // Agency reports
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'audit:read', 'audit:create',
    'settings:read', 'settings:update',
  ],
  BROKER: [
    'dashboard:read',
    'users:read', // Only assigned clients
    'properties:read', 'properties:create', 'properties:update', // Assigned properties
    'contracts:read', 'contracts:create', 'contracts:update', // Assigned contracts
    'payments:read', 'payments:create', 'payments:update', // Assigned payments
    'reports:read', 'reports:export', // Broker portfolio reports
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create', 'notifications:update',
    'settings:read', 'settings:update',
  ],
  PROPRIETARIO: [
    'dashboard:read',
    'properties:read', 'properties:create', 'properties:update', 'properties:delete', // Own properties
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete', // Own contracts
    'payments:read', 'payments:create', 'payments:update', 'payments:delete', // Own payments
    'reports:read', 'reports:create', 'reports:export', // Own reports
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'settings:read', 'settings:update',
  ],
  INDEPENDENT_OWNER: [
    'dashboard:read',
    'users:read', 'users:create', 'users:update', 'users:delete', // Can manage tenants
    'properties:read', 'properties:create', 'properties:update', 'properties:delete', // Full property management
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete', // Full contract management with digital signatures
    'payments:read', 'payments:create', 'payments:update', 'payments:delete', // Full payment control
    'reports:read', 'reports:create', 'reports:export', // Full reporting (Excel/XML)
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'documents:read', 'documents:create', // Receipts, invoices, XML generation
    'settings:read', 'settings:update', // Payment split configuration (MR3X + owner)
    'integrations:read', 'integrations:update', // Zapsign, payment gateways
  ],
  INQUILINO: [
    'dashboard:read',
    'properties:read', // Only rented property
    'contracts:read', // Only own contract
    'payments:read', 'payments:create', 'payments:update', // Own payments
    'reports:read', 'reports:export', // Own reports
    'chat:read', 'chat:create', 'chat:update', 'chat:delete',
    'notifications:read', 'notifications:create',
    'settings:read', 'settings:update',
  ],
  BUILDING_MANAGER: [
    'dashboard:read',
    'properties:read', // Properties in managed buildings
    'contracts:read', // Contracts for managed properties
    'payments:read', // Building-related payments
    'reports:read', 'reports:export', // Building reports
    'chat:read', 'chat:create', 'chat:update',
    'notifications:read', 'notifications:create', 'notifications:update',
    'settings:read', 'settings:update',
  ],
  LEGAL_AUDITOR: [
    'dashboard:read',
    'properties:read', // Read-only access
    'contracts:read', // Read-only access
    'payments:read', // Read-only access
    'reports:read', 'reports:export', // Read-only reports
    'audit:read', 'audit:create', // Audit logs
    'settings:read', // Read-only settings
  ],
  REPRESENTATIVE: [
    'dashboard:read',
    'users:read', // Only leads and referrals
    'agencies:read', // Only referred agencies
    'reports:read', 'reports:export', // Commission reports
    'settings:read', 'settings:update', // Profile settings
  ],
  API_CLIENT: [
    'properties:read',
    'contracts:read',
    'payments:read',
    'reports:read',
  ],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Debug loading state changes
  useEffect(() => {
    console.log('AuthContext loading state changed:', loading)
  }, [loading])

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Get user permissions
  const getUserPermissions = (role: string): string[] => {
    return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []
  }

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const permissions = getUserPermissions(user.role)
    return permissions.includes(permission)
  }


  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token
        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find(c => c.trim().startsWith('jwt_token='))
        
        if (tokenCookie) {
          const token = tokenCookie.split('=')[1]
          
          // Try to get user details with timeout
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/users/details`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            })
            
            clearTimeout(timeoutId)
            
            if (response.ok) {
              const userData = await response.json()
              setUser(userData)
            } else if (response.status === 401) {
              // Token expired or invalid - clear and require re-login
              console.log('Token expired or invalid')
              document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
              setUser(null)
            } else {
              // Other error, clear token
              console.error('Auth initialization failed:', response.status)
              document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
              setUser(null)
            }
          } catch (error) {
            console.error('Auth initialization error:', error)
            // Clear invalid token
            document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            setUser(null)
          }
        } else {
          // No token found
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Add a fallback timeout to ensure loading is always set to false
    const fallbackTimeout = setTimeout(() => {
      setLoading(false)
    }, 10000) // 10 second fallback

    initAuth().finally(() => {
      clearTimeout(fallbackTimeout)
    })
  }, [])

  // No auto-refresh needed - tokens last 7 days

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.login({ email, password })
      setUser(response.user)
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      toast.success('Logout realizado com sucesso!')
    }
  }

  const logoutAll = async () => {
    try {
      await authAPI.logoutAll()
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      setUser(null)
      toast.success('Logout de todos os dispositivos realizado com sucesso!')
    }
  }

  const register = async (data: any) => {
    try {
      setLoading(true)
      await authAPI.register(data)
      toast.success('Conta criada com sucesso! Faça login para continuar.')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      await authAPI.forgotPassword(email)
      toast.success('Email de recuperação enviado!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação')
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authAPI.resetPassword(token, newPassword)
      toast.success('Senha redefinida com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao redefinir senha')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    logoutAll,
    register,
    forgotPassword,
    resetPassword,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
