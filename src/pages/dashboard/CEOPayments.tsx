import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  User,
  Building,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { dashboardAPI } from '../../api';

export function CEOPayments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch CEO dashboard data which includes payments
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['ceo-dashboard'],
    queryFn: () => dashboardAPI.getDashboard(),
    enabled: user?.role === 'CEO',
  });

  if (user?.role !== 'CEO') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingPayments = dashboard?.pendingPayments || [];
  const recentPayments = dashboard?.recentPayments || [];

  // Filter payments based on search and filters
  const filterPayments = (payments: any[]) => {
    return payments.filter((payment: any) => {
      const searchMatch = searchTerm === '' ||
        payment.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const typeMatch = typeFilter === 'all' || payment.type === typeFilter;

      return searchMatch && typeMatch;
    });
  };

  const filteredPendingPayments = filterPayments(pendingPayments);
  const filteredRecentPayments = filterPayments(recentPayments);

  // Calculate totals
  // Pending payments use monthlyRent (from contracts), recent payments use amount
  const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + (Number(p.monthlyRent) || 0), 0);
  const totalReceived = recentPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-primary" />
            Pagamentos da Plataforma
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Acompanhe os pagamentos de todas as agências e proprietários independentes
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Recebido</p>
            <p className="text-sm sm:text-lg font-bold text-green-600">{formatCurrency(totalReceived)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Pendente</p>
            <p className="text-sm sm:text-lg font-bold text-red-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pagamentos Recentes</p>
            <p className="text-sm sm:text-lg font-bold">{recentPayments.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pagamentos Atrasados</p>
            <p className="text-sm sm:text-lg font-bold text-orange-600">{pendingPayments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs text-muted-foreground mb-1 block">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por imóvel, inquilino ou agência..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status" className="text-xs text-muted-foreground mb-1 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="received">Recebidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="type" className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                  <SelectItem value="CONDOMINIO">Condomínio</SelectItem>
                  <SelectItem value="IPTU">IPTU</SelectItem>
                  <SelectItem value="OUTROS">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {(statusFilter === 'all' || statusFilter === 'pending') && filteredPendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Pagamentos Pendentes
                </CardTitle>
                <CardDescription className="mt-1">Contratos com pagamentos em atraso</CardDescription>
              </div>
              <Badge variant="destructive" className="w-fit">
                {filteredPendingPayments.length} pendentes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPendingPayments.map((payment: any, index: number) => (
                <div
                  key={payment.contractId || index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="font-medium truncate">{payment.property?.name || payment.property?.address || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">{payment.tenant?.name || '-'}</span>
                    </div>
                    {payment.agency?.name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate">{payment.agency.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                    <p className="font-semibold text-red-600">
                      {formatCurrency(Number(payment.monthlyRent || 0))}
                    </p>
                    {payment.daysOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        {payment.daysOverdue} dias em atraso
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      {(statusFilter === 'all' || statusFilter === 'received') && filteredRecentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Pagamentos Recentes
                </CardTitle>
                <CardDescription className="mt-1">Últimos pagamentos recebidos na plataforma</CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-700 w-fit">
                {filteredRecentPayments.length} recebidos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRecentPayments.map((payment: any, index: number) => (
                <div
                  key={payment.id || index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-green-50 border border-green-100 rounded-lg gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="font-medium truncate">{payment.property?.name || payment.property?.address || '-'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{payment.tenant?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{payment.date ? formatDate(payment.date) : '-'}</span>
                      </div>
                    </div>
                    {payment.agency?.name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate">{payment.agency.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(Number(payment.amount || 0))}
                    </p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {payment.type || '-'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredPendingPayments.length === 0 && filteredRecentPayments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pagamento encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Ainda não há pagamentos registrados na plataforma'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
