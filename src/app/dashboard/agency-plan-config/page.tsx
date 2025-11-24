'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { plansAPI, agenciesAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ShieldCheck, Star, Zap, Package, Crown, Building2 } from 'lucide-react'

interface PlanOption {
  id: string
  name: string
  description?: string
  price: number
  propertyLimit: number
  userLimit: number
  features: string[]
  subscribers?: number
}

const PLAN_ICONS: Record<string, JSX.Element> = {
  free: <Package className="w-6 h-6" />,
  essential: <Star className="w-6 h-6" />,
  professional: <Building2 className="w-6 h-6" />,
  enterprise: <Crown className="w-6 h-6" />,
}

const getPlanIcon = (planName: string) => {
  const key = planName.toLowerCase()
  return PLAN_ICONS[key] || <Zap className="w-6 h-6" />
}

export default function AgencyPlanConfigPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const { data: plans = [], isLoading: plansLoading } = useQuery<PlanOption[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await plansAPI.getPlans()
      return response.map((plan: any) => ({
        ...plan,
        price: Number(plan.price || 0),
        propertyLimit: Number(plan.propertyLimit || 0),
        userLimit: Number(plan.userLimit || 0),
        features: Array.isArray(plan.features)
          ? plan.features
          : typeof plan.features === 'string'
            ? (() => {
                try {
                  const parsed = JSON.parse(plan.features)
                  if (Array.isArray(parsed)) return parsed
                } catch (_) {
                  /* ignore */
                }
                return String(plan.features)
                  .split(',')
                  .map((item: string) => item.trim())
                  .filter(Boolean)
              })()
            : [],
      }))
    },
  })

  const { data: agencyData, isLoading: agencyLoading } = useQuery({
    queryKey: ['agency-plan', user?.agencyId],
    queryFn: async () => {
      if (!user?.agencyId) throw new Error('agencyId not found')
      return agenciesAPI.getAgencyById(user.agencyId)
    },
    enabled: Boolean(user?.agencyId && user?.role === 'AGENCY_ADMIN'),
  })

  useEffect(() => {
    if (agencyData?.plan) {
      setSelectedPlan(agencyData.plan)
    }
  }, [agencyData?.plan])

  const updatePlanMutation = useMutation({
    mutationFn: async (planName: string) => {
      if (!user?.agencyId) throw new Error('Agency ID not available')
      return agenciesAPI.updateAgency(user.agencyId, { plan: planName })
    },
    onSuccess: (_data, variables) => {
      toast.success('Plano da agência atualizado com sucesso!')
      setSelectedPlan(variables)
      if (user?.agencyId) {
        queryClient.invalidateQueries({ queryKey: ['agency-plan', user.agencyId] })
      }
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.message || 'Não foi possível atualizar o plano'
      toast.error(message)
    },
  })

  const currentPlan = useMemo(() => {
    if (!selectedPlan) return undefined
    return plans.find(plan => plan.name?.toLowerCase() === selectedPlan.toLowerCase())
  }, [plans, selectedPlan])

  if (user?.role !== 'AGENCY_ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-muted-foreground">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground">Somente diretores de agência podem configurar o plano.</p>
        </div>
      </div>
    )
  }

  if (!user?.agencyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-muted-foreground">Agência não encontrada</h2>
          <p className="text-sm text-muted-foreground">Para configurar o plano, finalize o cadastro da sua agência.</p>
        </div>
      </div>
    )
  }

  if (plansLoading || agencyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Plano da Agência</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Defina o plano ideal para a sua agência. A cobrança é administrada pela plataforma MR3X.
        </p>
      </div>

      {currentPlan && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Plano atual</CardTitle>
            <CardDescription>
              Você está utilizando o plano <span className="font-semibold text-primary">{currentPlan.name}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Valor mensal</p>
              <p className="text-lg font-semibold">
                {currentPlan.price === 0 ? 'Gratuito' : `R$ ${currentPlan.price.toFixed(2)}/mês`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Limite de propriedades</p>
              <p className="text-lg font-semibold">{currentPlan.propertyLimit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Limite de usuários</p>
              <p className="text-lg font-semibold">{currentPlan.userLimit}</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Qualquer mudança de plano reflete imediatamente nos limites de propriedades e usuários disponíveis.
            </p>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map(plan => {
          const isSelected = selectedPlan?.toLowerCase() === plan.name.toLowerCase()

          return (
            <Card
              key={plan.id}
              className={`relative transition-all ${
                isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'hover:shadow-md'
              }`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${isSelected ? 'bg-primary' : 'bg-muted'}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{plan.name}</CardTitle>
                      <CardDescription>{plan.description || 'Plano da plataforma MR3X'}</CardDescription>
                    </div>
                  </div>
                  {isSelected && <Badge variant="secondary">Plano atual</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    {plan.price === 0 ? 'Gratuito' : `R$ ${plan.price.toFixed(2)}`}
                    {plan.price > 0 && <span className="text-sm text-muted-foreground">/mês</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.subscribers ?? 0} agências utilizando este plano
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Limite de propriedades</span>
                    <Badge variant="outline">{plan.propertyLimit}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Limite de usuários</span>
                    <Badge variant="outline">{plan.userLimit}</Badge>
                  </div>
                </div>

                {plan.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recursos incluídos</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isSelected ? 'secondary' : 'default'}
                  disabled={isSelected || updatePlanMutation.isPending}
                  onClick={() => updatePlanMutation.mutate(plan.name)}
                >
                  {isSelected ? 'Plano selecionado' : 'Selecionar plano'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="text-xs text-muted-foreground">
        Atualizações de cobrança, faturamento e notas fiscais continuam sendo feitas pela MR3X. Entre em contato com o suporte comercial para planos customizados.
      </div>
    </div>
  )
}


