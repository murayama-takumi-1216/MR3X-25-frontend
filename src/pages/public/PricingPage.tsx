import { useState, useEffect } from 'react';
import { Check, X, Star, Zap, Crown, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { plansAPI } from '../../api';

interface PlanConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  maxActiveContracts: number;
  maxInternalUsers: number;
  unlimitedInspections: boolean;
  unlimitedSettlements: boolean;
  unlimitedUsers: boolean;
  apiAccessIncluded: boolean;
  apiAccessOptional: boolean;
  advancedReports: boolean;
  automations: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
  support24x7: boolean;
  extraContractPrice: number;
  inspectionPrice: number | null;
  settlementPrice: number | null;
  screeningPrice: number;
  apiAddOnPrice: number | null;
  supportTier: string;
  features: string[];
  isPopular: boolean;
  displayOrder: number;
}

const getPlanIcon = (planName: string) => {
  switch (planName) {
    case 'FREE':
      return <Building2 className="w-6 h-6" />;
    case 'BASIC':
      return <Zap className="w-6 h-6" />;
    case 'PROFESSIONAL':
      return <Star className="w-6 h-6" />;
    case 'ENTERPRISE':
      return <Crown className="w-6 h-6" />;
    default:
      return <Building2 className="w-6 h-6" />;
  }
};

const getPlanColor = (planName: string) => {
  switch (planName) {
    case 'FREE':
      return 'from-gray-500 to-gray-600';
    case 'BASIC':
      return 'from-blue-500 to-blue-600';
    case 'PROFESSIONAL':
      return 'from-purple-500 to-purple-600';
    case 'ENTERPRISE':
      return 'from-amber-500 to-amber-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getPlanBorderColor = (planName: string, isPopular: boolean) => {
  if (isPopular) return 'border-primary ring-2 ring-primary';
  switch (planName) {
    case 'FREE':
      return 'border-gray-200';
    case 'BASIC':
      return 'border-blue-200';
    case 'PROFESSIONAL':
      return 'border-purple-200';
    case 'ENTERPRISE':
      return 'border-amber-200';
    default:
      return 'border-gray-200';
  }
};

export function PricingPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await plansAPI.getPricing();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getAnnualPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 * 0.8;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planos e Precos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para sua imobiliaria. Pague apenas pelo que usar.
          </p>

          <div className="flex justify-center mb-8">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annual')}>
              <TabsList>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="annual">
                  Anual
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    -20%
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${getPlanBorderColor(plan.name, plan.isPopular)} transition-all duration-200 hover:shadow-lg`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getPlanColor(plan.name)} flex items-center justify-center text-white mb-4`}>
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(billingCycle === 'monthly' ? plan.price : getAnnualPrice(plan.price) / 12)}
                    </span>
                    <span className="text-gray-500">/mes</span>
                  </div>
                  {billingCycle === 'annual' && plan.price > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {formatPrice(getAnnualPrice(plan.price))}/ano
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      <strong>{plan.maxActiveContracts}</strong> contratos ativos
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      <strong>{plan.maxInternalUsers === -1 ? 'Ilimitados' : plan.maxInternalUsers}</strong> usuários
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
                    Precos sob demanda
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Contrato extra</span>
                      <span className="font-medium">{formatPrice(plan.extraContractPrice)}</span>
                    </div>
                    {plan.inspectionPrice !== null && (
                      <div className="flex justify-between text-gray-600">
                        <span>Vistoria</span>
                        <span className="font-medium">{formatPrice(plan.inspectionPrice)}</span>
                      </div>
                    )}
                    {plan.settlementPrice !== null && (
                      <div className="flex justify-between text-gray-600">
                        <span>Acordo</span>
                        <span className="font-medium">{formatPrice(plan.settlementPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Analise de inquilino</span>
                      <span className="font-medium">{formatPrice(plan.screeningPrice)}</span>
                    </div>
                    {plan.apiAddOnPrice && (
                      <div className="flex justify-between text-gray-600">
                        <span>API (opcional)</span>
                        <span className="font-medium">+{formatPrice(plan.apiAddOnPrice)}/mes</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${plan.isPopular ? '' : 'variant-outline'}`}
                  variant={plan.isPopular ? 'default' : 'outline'}
                >
                  {plan.price === 0 ? 'Comecar Gratis' : 'Assinar Agora'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Comparativo de Recursos</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-medium text-gray-600">Recurso</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-4 font-medium">
                    {plan.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Contratos Ativos</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4 font-medium">
                    {plan.maxActiveContracts}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Usuários</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4 font-medium">
                    {plan.maxInternalUsers === -1 ? 'Ilimitados' : plan.maxInternalUsers}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Vistorias Ilimitadas</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.unlimitedInspections ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Acordos Ilimitados</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.unlimitedSettlements ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Relatorios Avancados</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.advancedReports ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Automacoes</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.automations ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">API Incluida</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.apiAccessIncluded ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : plan.apiAccessOptional ? (
                      <span className="text-xs text-amber-600">Opcional</span>
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">White-Label</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.whiteLabel ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Suporte 24/7</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.support24x7 ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-2">O que acontece se eu ultrapassar o limite de contratos?</h3>
            <p className="text-gray-600">
              Voce pode adicionar contratos extras pagando uma taxa por contrato, conforme o preco do seu plano.
              Isso permite que voce cresca sem precisar fazer upgrade imediato.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Posso fazer upgrade ou downgrade a qualquer momento?</h3>
            <p className="text-gray-600">
              Sim! Voce pode alterar seu plano a qualquer momento. No upgrade, o valor e proporcional aos dias restantes.
              No downgrade, contratos excedentes serao congelados ate que voce os remova ou faca upgrade novamente.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-2">O que sao contratos congelados?</h3>
            <p className="text-gray-600">
              Contratos congelados sao contratos que excedem o limite do seu plano. Eles permanecem seguros no sistema,
              mas nao podem receber pagamentos ou ser editados ate que sejam descongelados (fazendo upgrade ou liberando espaco).
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Como funciona o API add-on?</h3>
            <p className="text-gray-600">
              No plano Professional, voce pode adicionar acesso a API por R$ 29/mes.
              No plano Enterprise, o acesso a API ja esta incluido sem custo adicional.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para comecar?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Comece gratis e faca upgrade quando precisar.
        </p>
        <Button size="lg" className="px-8">
          Criar Conta Gratis
        </Button>
      </div>
    </div>
  );
}

export default PricingPage;
