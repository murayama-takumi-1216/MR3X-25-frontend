import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  FileText,
  Users,
  AlertTriangle,
  ArrowUpCircle,
  Lock,
  CheckCircle2,
  DollarSign,
  Search,
  FileCheck,
  Handshake,
} from 'lucide-react';
import { plansAPI } from '../../api';

interface PlanUsage {
  plan: string;
  planDisplayName: string;
  contracts: {
    current: number;
    limit: number;
    frozen: number;
  };
  users: {
    current: number;
    limit: number;
    frozen: number;
  };
  pricing: {
    extraContract: number;
    inspection: number | null;
    settlement: number | null;
    screening: number;
  };
  features: {
    unlimitedInspections: boolean;
    unlimitedSettlements: boolean;
    apiAccess: boolean;
    apiAddOnEnabled: boolean;
    advancedReports: boolean;
    automations: boolean;
    whiteLabel: boolean;
  };
  billing: {
    monthlyPrice: number;
    apiAddOnPrice: number | null;
    supportTier: string;
  };
}

interface PlanUsageWidgetProps {
  agencyId: string;
  onUpgradeClick?: () => void;
  showPricing?: boolean;
  compact?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getPlanColor = (plan: string) => {
  switch (plan) {
    case 'FREE':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'BASIC':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'PROFESSIONAL':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'ENTERPRISE':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export function PlanUsageWidget({
  agencyId,
  onUpgradeClick,
  showPricing = false,
  compact = false,
}: PlanUsageWidgetProps) {
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const data = await plansAPI.getAgencyUsage(agencyId);
        setUsage(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Erro ao carregar uso do plano');
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) {
      fetchUsage();
    }
  }, [agencyId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uso do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uso do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const contractPercent =
    usage.contracts.limit > 0
      ? Math.min(100, (usage.contracts.current / usage.contracts.limit) * 100)
      : 0;
  const userPercent =
    usage.users.limit > 0 && usage.users.limit < 9999
      ? Math.min(100, (usage.users.current / usage.users.limit) * 100)
      : 0;

  const isNearLimit = contractPercent >= 80 || userPercent >= 80;
  const isAtLimit = contractPercent >= 100 || userPercent >= 100;
  const hasFrozenItems = usage.contracts.frozen > 0 || usage.users.frozen > 0;

  if (compact) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getPlanColor(usage.plan)}>{usage.planDisplayName}</Badge>
              <span className="text-sm text-muted-foreground">
                {usage.contracts.current}/{usage.contracts.limit} contratos
              </span>
            </div>
            {(isAtLimit || hasFrozenItems) && (
              <Button size="sm" variant="outline" onClick={onUpgradeClick}>
                <ArrowUpCircle className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Uso do Plano</CardTitle>
          <Badge className={getPlanColor(usage.plan)}>{usage.planDisplayName}</Badge>
        </div>
        {usage.billing.monthlyPrice > 0 && (
          <p className="text-sm text-muted-foreground">
            {formatCurrency(usage.billing.monthlyPrice)}/mes
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>Contratos Ativos</span>
            </div>
            <span className="font-medium">
              {usage.contracts.current} / {usage.contracts.limit}
            </span>
          </div>
          <Progress
            value={contractPercent}
            className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
          />
          {usage.contracts.frozen > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Lock className="w-3 h-3" />
              <span>{usage.contracts.frozen} contrato(s) congelado(s)</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>Usuários</span>
            </div>
            <span className="font-medium">
              {usage.users.current} / {usage.users.limit >= 9999 ? '∞' : usage.users.limit}
            </span>
          </div>
          {usage.users.limit < 9999 && <Progress value={userPercent} className="h-2" />}
          {usage.users.frozen > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Lock className="w-3 h-3" />
              <span>{usage.users.frozen} usuario(s) congelado(s)</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Recursos</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              {usage.features.unlimitedInspections ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="text-muted-foreground">Vistorias</span>
            </div>
            <div className="flex items-center gap-1.5">
              {usage.features.unlimitedSettlements ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="text-muted-foreground">Acordos</span>
            </div>
            <div className="flex items-center gap-1.5">
              {usage.features.apiAccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="text-muted-foreground">API</span>
              {usage.features.apiAddOnEnabled && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  Add-on
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {usage.features.advancedReports ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="text-muted-foreground">Relatorios</span>
            </div>
          </div>
        </div>

        {showPricing && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Precos sob demanda
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Contrato
                </span>
                <span>{formatCurrency(usage.pricing.extraContract)}</span>
              </div>
              {usage.pricing.inspection !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    Vistoria
                  </span>
                  <span>{formatCurrency(usage.pricing.inspection)}</span>
                </div>
              )}
              {usage.pricing.settlement !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Handshake className="w-3 h-3" />
                    Acordo
                  </span>
                  <span>{formatCurrency(usage.pricing.settlement)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  Analise
                </span>
                <span>{formatCurrency(usage.pricing.screening)}</span>
              </div>
            </div>
          </div>
        )}

        {hasFrozenItems && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <p className="mb-2">
                Voce tem itens congelados devido ao limite do seu plano.
              </p>
              {onUpgradeClick && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-amber-500 text-amber-700 hover:bg-amber-100"
                  onClick={onUpgradeClick}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Fazer Upgrade
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isAtLimit && !hasFrozenItems && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="mb-2">
                Voce atingiu o limite do seu plano. Novos contratos serao cobrados individualmente
                ou voce pode fazer upgrade.
              </p>
              {onUpgradeClick && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-red-500 text-red-700 hover:bg-red-100"
                  onClick={onUpgradeClick}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Ver Planos
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && !hasFrozenItems && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Voce esta proximo do limite do seu plano. Considere fazer upgrade.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default PlanUsageWidget;
