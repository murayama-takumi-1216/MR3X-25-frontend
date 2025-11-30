import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api';
import { formatCurrency } from '../../lib/utils';
import {
  Home, FileText, DollarSign, Bell, Clock,
  CheckCircle, AlertTriangle, User, Phone, Mail,
  CreditCard, Receipt
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['tenant-dashboard', user?.id],
    queryFn: () => dashboardAPI.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const property = dashboard?.property;
  const contract = dashboard?.contract;
  const paymentHistory = dashboard?.paymentHistory || [];

  // Calculate payment status
  const getPaymentStatus = () => {
    if (!property?.nextDueDate) return { status: 'unknown', label: 'Sem data', color: 'gray' };

    const daysUntilDue = property.daysUntilDue;
    if (daysUntilDue === null) return { status: 'unknown', label: 'Sem data', color: 'gray' };

    if (daysUntilDue < 0) {
      return { status: 'overdue', label: `${Math.abs(daysUntilDue)} dias em atraso`, color: 'red' };
    } else if (daysUntilDue <= 5) {
      return { status: 'upcoming', label: `Vence em ${daysUntilDue} dias`, color: 'yellow' };
    } else {
      return { status: 'ok', label: 'Em dia', color: 'green' };
    }
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Olá, {user?.name || 'Inquilino'}!
        </h1>
        <p className="text-blue-100">
          Bem-vindo ao seu painel de locação. Aqui você pode acompanhar seu contrato, pagamentos e documentos.
        </p>
      </div>

      {/* Property Info Card */}
      {property ? (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Meu Imóvel</CardTitle>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Alugado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{property.name || 'Imóvel'}</h3>
                <p className="text-muted-foreground">{property.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Valor do Aluguel</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(Number(property.monthlyRent) || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                  <p className="text-lg font-semibold">
                    {property.nextDueDate
                      ? new Date(property.nextDueDate).toLocaleDateString('pt-BR')
                      : 'Não definido'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status do Pagamento</p>
                  <Badge
                    className={`
                      ${paymentStatus.color === 'green' ? 'bg-green-100 text-green-700' : ''}
                      ${paymentStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${paymentStatus.color === 'red' ? 'bg-red-100 text-red-700' : ''}
                      ${paymentStatus.color === 'gray' ? 'bg-gray-100 text-gray-700' : ''}
                    `}
                  >
                    {paymentStatus.status === 'ok' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {paymentStatus.status === 'upcoming' && <Clock className="w-3 h-3 mr-1" />}
                    {paymentStatus.status === 'overdue' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {paymentStatus.label}
                  </Badge>
                </div>
              </div>

              {/* Property Owner Info */}
              {property.owner && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Proprietário / Administrador</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{property.owner.name}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {property.owner.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {property.owner.email}
                          </span>
                        )}
                        {property.owner.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {property.owner.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum imóvel vinculado</h3>
            <p className="text-muted-foreground">
              Você ainda não possui um imóvel vinculado à sua conta.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/dashboard/tenant-contract')}
        >
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="font-medium text-sm">Meu Contrato</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/dashboard/tenant-payments')}
        >
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="font-medium text-sm">Pagamentos</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/dashboard/notifications')}
        >
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="font-medium text-sm">Notificações</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/dashboard/tenant-profile')}
        >
          <CardContent className="p-4 text-center">
            <User className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="font-medium text-sm">Meu Perfil</p>
          </CardContent>
        </Card>
      </div>

      {/* Contract Summary */}
      {contract && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-lg">Resumo do Contrato</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/tenant-contract')}
              >
                Ver Detalhes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p className="font-semibold">
                  {contract.startDate
                    ? new Date(contract.startDate).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Término</p>
                <p className="font-semibold">
                  {contract.endDate
                    ? new Date(contract.endDate).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Mensal</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(Number(contract.monthlyRent) || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={
                  contract.status === 'ATIVO'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }>
                  {contract.status === 'ATIVO' ? 'Ativo' : contract.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/tenant-payments')}
            >
              Ver Todos
            </Button>
          </div>
          <CardDescription>Últimos pagamentos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.slice(0, 5).map((payment: any, index: number) => (
                <div
                  key={payment.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {payment.type === 'ALUGUEL' ? 'Aluguel' :
                         payment.type === 'CONDOMINIO' ? 'Condomínio' :
                         payment.type === 'IPTU' ? 'IPTU' : payment.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.date
                          ? new Date(payment.date).toLocaleDateString('pt-BR')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(Number(payment.amount) || 0)}
                    </p>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Pago
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pagamento registrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Alert */}
      {paymentStatus.status === 'overdue' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-700">Pagamento em Atraso</h4>
                <p className="text-sm text-red-600 mt-1">
                  Você possui um pagamento em atraso. Regularize sua situação para evitar multas e juros.
                </p>
                <Button
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  size="sm"
                  onClick={() => navigate('/dashboard/tenant-payments')}
                >
                  Realizar Pagamento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus.status === 'upcoming' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-700">Pagamento Próximo</h4>
                <p className="text-sm text-yellow-600 mt-1">
                  Seu próximo pagamento vence em breve. Fique atento à data de vencimento.
                </p>
                <Button
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                  size="sm"
                  onClick={() => navigate('/dashboard/tenant-payments')}
                >
                  Ver Pagamentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
