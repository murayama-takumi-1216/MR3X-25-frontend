import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api';
import { formatCurrency } from '../../lib/utils';
import {
  Home, Building2, FileText, DollarSign, Users, Clock,
  CheckCircle, AlertTriangle, TrendingUp, Calendar, Briefcase,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function BrokerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['broker-dashboard', user?.id],
    queryFn: () => dashboardAPI.getDashboard(),
  });

  const { data: dueDates } = useQuery({
    queryKey: ['broker-due-dates', user?.id],
    queryFn: () => dashboardAPI.getDueDates(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};
  const properties = dashboard?.properties || [];
  const contracts = dashboard?.contracts || [];
  const pendingContracts = dashboard?.pendingPayments || [];
  const recentPayments = dashboard?.recentPayments || [];

  // Calculate statistics
  const totalProperties = overview.totalProperties || properties.length || 0;
  const occupiedProperties = overview.occupiedProperties || properties.filter((p: any) => p.status === 'ALUGADO').length || 0;
  const activeContracts = overview.activeContracts || contracts.filter((c: any) => c.status === 'ATIVO').length || 0;
  const monthlyRevenue = overview.monthlyRevenue || 0;

  // Get upcoming due dates count
  const upcomingDueDates = dueDates?.filter((d: any) => d.status === 'upcoming' || d.status === 'overdue') || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-8 h-8" />
          <h1 className="text-2xl font-bold">
            Olá, {user?.name || 'Corretor'}!
          </h1>
        </div>
        <p className="text-yellow-100">
          Gerencie suas propriedades, contratos e acompanhe o desempenho dos imóveis sob sua responsabilidade.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meus Imóveis</p>
                <p className="text-2xl font-bold">{totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ocupados</p>
                <p className="text-2xl font-bold">{occupiedProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contratos Ativos</p>
                <p className="text-2xl font-bold">{activeContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(monthlyRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as principais funções</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/dashboard/properties')}
            >
              <Building2 className="w-6 h-6 text-blue-500" />
              <span className="text-sm">Meus Imóveis</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/dashboard/contracts')}
            >
              <FileText className="w-6 h-6 text-purple-500" />
              <span className="text-sm">Meus Contratos</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/dashboard/tenants')}
            >
              <Users className="w-6 h-6 text-green-500" />
              <span className="text-sm">Inquilinos</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/dashboard/payments')}
            >
              <DollarSign className="w-6 h-6 text-yellow-500" />
              <span className="text-sm">Pagamentos</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Properties */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Meus Imóveis</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/properties')}>
                Ver Todos
              </Button>
            </div>
            <CardDescription>Imóveis sob sua responsabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            {properties.length > 0 ? (
              <div className="space-y-3">
                {properties.slice(0, 5).map((property: any) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/properties/${property.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Home className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{property.name || 'Imóvel'}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {property.address}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      property.status === 'ALUGADO' ? 'bg-green-100 text-green-700' :
                      property.status === 'DISPONIVEL' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {property.status === 'ALUGADO' ? 'Alugado' :
                       property.status === 'DISPONIVEL' ? 'Disponível' :
                       property.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum imóvel atribuído</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate('/dashboard/properties')}
                >
                  Ver Todos os Imóveis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Due Dates */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-lg">Vencimentos</CardTitle>
              </div>
              {upcomingDueDates.length > 0 && (
                <Badge className="bg-orange-100 text-orange-700">
                  {upcomingDueDates.length} pendentes
                </Badge>
              )}
            </div>
            <CardDescription>Próximos vencimentos dos seus imóveis</CardDescription>
          </CardHeader>
          <CardContent>
            {dueDates && dueDates.length > 0 ? (
              <div className="space-y-3">
                {dueDates.slice(0, 5).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === 'overdue' ? 'bg-red-100' :
                        item.status === 'upcoming' ? 'bg-yellow-100' :
                        'bg-green-100'
                      }`}>
                        {item.status === 'overdue' ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : item.status === 'upcoming' ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.propertyName || item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.tenant?.name || 'Sem inquilino'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.nextDueDate || item.dueDate
                          ? new Date(item.nextDueDate || item.dueDate).toLocaleDateString('pt-BR')
                          : '-'}
                      </p>
                      <Badge variant="outline" className={`text-xs ${
                        item.status === 'overdue' ? 'border-red-300 text-red-700' :
                        item.status === 'upcoming' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }`}>
                        {item.status === 'overdue' ? 'Vencido' :
                         item.status === 'upcoming' ? 'Próximo' :
                         'Em dia'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum vencimento próximo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg">Pagamentos Recentes</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/payments')}>
              Ver Todos
            </Button>
          </div>
          <CardDescription>Últimos pagamentos recebidos</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.slice(0, 5).map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.property?.name || payment.property?.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.tenant?.name} • {payment.date
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
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pagamento recente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Contracts Alert */}
      {pendingContracts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-700">Pagamentos Pendentes</h4>
                <p className="text-sm text-red-600 mt-1">
                  Você tem {pendingContracts.length} pagamento(s) pendente(s) ou em atraso.
                </p>
                <Button
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  size="sm"
                  onClick={() => navigate('/dashboard/payments')}
                >
                  Ver Pagamentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ClipboardList className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-700">Suas Responsabilidades</h4>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Gerenciar imóveis atribuídos à você</li>
                <li>• Criar e preparar contratos</li>
                <li>• Realizar vistorias e inspeções</li>
                <li>• Atender inquilinos e proprietários</li>
                <li>• Gerar documentos necessários</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
