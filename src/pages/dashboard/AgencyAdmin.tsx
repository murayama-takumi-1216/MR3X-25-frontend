import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Users,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Building,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usersAPI } from '@/api'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CEPInput } from '@/components/ui/cep-input'
import { isValidCEPFormat } from '@/lib/validation'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AgencyAdmin() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const isCEO = user?.role === 'CEO'
  const canView = user && ['CEO', 'ADMIN'].includes(user.role)
  const canUpdate = canView && !isCEO
  const canDelete = canView && !isCEO

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<any>(null)
  const [agencyToDelete, setAgencyToDelete] = useState<any>(null)
  const [agencyDetail, setAgencyDetail] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: agencyAdminsData, isLoading } = useQuery({
    queryKey: ['agency-admins'],
    queryFn: () => usersAPI.listUsers({ role: 'AGENCY_ADMIN' }),
    enabled: !!canView,
  })

  const agencyAdmins = (agencyAdminsData as any)?.items || []

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold">Acesso Negado</h3>
          <p className="text-muted-foreground">Voce nao tem permissao para acessar esta pagina.</p>
        </div>
      </div>
    )
  }

  const closeAllModals = () => {
    setShowEditModal(false)
    setShowDetailModal(false)
    setSelectedAgency(null)
    setAgencyToDelete(null)
    setAgencyDetail(null)
  }

  const updateAgencyAdminMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-admins'] })
      closeAllModals()
      toast.success('Diretor de agencia atualizado com sucesso')
    },
    onError: (error: any) => {
      let errorMessage = 'Erro ao atualizar diretor de agencia'
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    },
  })

  const deleteAgencyAdminMutation = useMutation({
    mutationFn: (id: string) => usersAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-admins'] })
      closeAllModals()
      toast.success('Diretor de agencia excluido com sucesso')
    },
    onError: (error: any) => {
      let errorMessage = 'Erro ao excluir diretor de agencia'
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    },
  })

  const handleEditAgencyAdmin = async () => {
    if (!canUpdate) {
      toast.error('Voce nao tem permissao para atualizar diretores de agencia')
      return
    }

    if (!selectedAgency) return

    if (!selectedAgency.name || !selectedAgency.email) {
      toast.error('Nome e e-mail sao obrigatorios')
      return
    }

    if (selectedAgency.zipCode && selectedAgency.zipCode.trim() !== '') {
      if (!isValidCEPFormat(selectedAgency.zipCode)) {
        toast.error('CEP invalido. Por favor, insira um CEP valido (00000-000)')
        return
      }
    }

    setUpdating(true)
    try {
      const updateData = {
        name: selectedAgency.name,
        email: selectedAgency.email,
        document: selectedAgency.document,
        phone: selectedAgency.phone,
        address: selectedAgency.address,
        city: selectedAgency.city,
        state: selectedAgency.state,
        zipCode: selectedAgency.zipCode || undefined,
        plan: selectedAgency.plan,
        status: selectedAgency.status,
      }

      updateAgencyAdminMutation.mutate({ id: selectedAgency.id, data: updateData })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar diretor de agencia')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAgencyAdmin = async () => {
    if (!canDelete) {
      toast.error('Voce nao tem permissao para excluir diretores de agencia')
      return
    }

    if (!agencyToDelete) return

    setDeleting(true)
    try {
      deleteAgencyAdminMutation.mutate(agencyToDelete.id)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir diretor de agencia')
    } finally {
      setDeleting(false)
    }
  }

  const handleViewAgency = (agency: any) => {
    setAgencyDetail(agency)
    setShowDetailModal(true)
  }

  const handleEditAgencyClick = (agency: any) => {
    setSelectedAgency(agency)
    setShowEditModal(true)
  }

  const handleDeleteAgencyClick = (agency: any) => {
    setAgencyToDelete(agency)
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'ESSENTIAL': return 'bg-blue-100 text-blue-800'
      case 'PROFESSIONAL': return 'bg-green-100 text-green-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'Gratuito'
      case 'ESSENTIAL': return 'Essencial'
      case 'PROFESSIONAL': return 'Profissional'
      case 'ENTERPRISE': return 'Empresarial'
      default: return plan
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo'
      case 'SUSPENDED': return 'Suspenso'
      case 'PENDING': return 'Pendente'
      default: return status
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diretor Agencia</h1>
            <p className="text-muted-foreground">Visualize e gerencie os diretores de agencias imobiliarias</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['agency-admins'] })}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Carregando diretores de agencia...</p>
          </div>
        ) : agencyAdmins && agencyAdmins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencyAdmins.map((admin: any) => (
              <Card key={admin.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{admin.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Diretor de Agencia</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewAgency(admin)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        {canUpdate && (
                          <DropdownMenuItem onClick={() => handleEditAgencyClick(admin)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteAgencyClick(admin)}
                            className="text-red-600 focus:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  {admin.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{admin.phone}</span>
                    </div>
                  )}
                  {admin.document && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{admin.document}</span>
                    </div>
                  )}
                  {(admin.city || admin.state) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{[admin.city, admin.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Badge className={getPlanColor(admin.plan)}>
                        {getPlanLabel(admin.plan)}
                      </Badge>
                      <Badge className={getStatusColor(admin.status)}>
                        {getStatusLabel(admin.status)}
                      </Badge>
                    </div>
                  </div>

                  {admin.agency && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Agencia:</span>
                        <span className="text-muted-foreground truncate">{admin.agency.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum diretor de agencia encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Nenhum diretor de agencia imobiliaria cadastrado no sistema
            </p>
          </div>
        )}

        {}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Diretor de Agencia</DialogTitle>
              <DialogDescription>
                Visualize todas as informacoes do diretor de agencia imobiliaria
              </DialogDescription>
            </DialogHeader>
            {agencyDetail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.name}</div>
                </div>
                <div>
                  <Label>Documento (CPF/CNPJ)</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.document || '-'}</div>
                </div>
                <div>
                  <Label>E-mail</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.email}</div>
                </div>
                <div>
                  <Label>Telefone</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.phone || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <Label>Endereco</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.address || '-'}</div>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.city || '-'}</div>
                </div>
                <div>
                  <Label>Estado</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.state || '-'}</div>
                </div>
                <div>
                  <Label>CEP</Label>
                  <div className="text-sm text-foreground mt-1">{agencyDetail.zipCode || '-'}</div>
                </div>
                <div>
                  <Label>Plano</Label>
                  <div className="text-sm text-foreground mt-1">{getPlanLabel(agencyDetail.plan)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="text-sm text-foreground mt-1">{getStatusLabel(agencyDetail.status)}</div>
                </div>
                <div>
                  <Label>Data de Criacao</Label>
                  <div className="text-sm text-foreground mt-1">
                    {agencyDetail.createdAt ? new Date(agencyDetail.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Diretor de Agencia</DialogTitle>
              <DialogDescription>
                Atualize as informacoes do diretor. Nome e e-mail sao obrigatorios.
              </DialogDescription>
            </DialogHeader>
            {selectedAgency && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input id="edit-name" value={selectedAgency.name || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">E-mail</Label>
                    <Input id="edit-email" type="email" value={selectedAgency.email || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-document">Documento (CPF/CNPJ)</Label>
                    <Input id="edit-document" value={selectedAgency.document || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, document: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input id="edit-phone" value={selectedAgency.phone || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={selectedAgency.status || 'ACTIVE'}
                      onChange={(e) => setSelectedAgency({ ...selectedAgency, status: e.target.value })}
                    >
                      <option value="ACTIVE">Ativo</option>
                      <option value="SUSPENDED">Suspenso</option>
                      <option value="PENDING">Pendente</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-address">Endereco</Label>
                    <Input id="edit-address" value={selectedAgency.address || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, address: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">Cidade</Label>
                    <Input id="edit-city" value={selectedAgency.city || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, city: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-state">Estado</Label>
                    <Input id="edit-state" value={selectedAgency.state || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, state: e.target.value })} />
                  </div>
                  <div>
                    <CEPInput
                      value={selectedAgency.zipCode || ''}
                      onChange={(value) => setSelectedAgency({ ...selectedAgency, zipCode: value })}
                      onCEPData={(data) => {
                        setSelectedAgency({
                          ...selectedAgency,
                          address: data.street || selectedAgency.address,
                          city: data.city || selectedAgency.city,
                          state: data.state || selectedAgency.state,
                        })
                      }}
                      label="CEP"
                      placeholder="00000-000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-plan">Plano</Label>
                    <select
                      id="edit-plan"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={selectedAgency.plan || 'FREE'}
                      onChange={(e) => setSelectedAgency({ ...selectedAgency, plan: e.target.value })}
                    >
                      <option value="FREE">Gratuito</option>
                      <option value="ESSENTIAL">Essencial</option>
                      <option value="PROFESSIONAL">Profissional</option>
                      <option value="ENTERPRISE">Empresarial</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={closeAllModals}>Cancelar</Button>
                  <Button onClick={handleEditAgencyAdmin} disabled={updating} className="bg-orange-600 hover:bg-orange-700 text-white">
                    {updating ? 'Salvando...' : 'Salvar alteracoes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {}
        <AlertDialog open={!!agencyToDelete} onOpenChange={() => setAgencyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o diretor de agencia "{agencyToDelete?.name}"?
                Esta acao nao pode ser desfeita e todos os dados relacionados serao perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAgencyAdmin}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
