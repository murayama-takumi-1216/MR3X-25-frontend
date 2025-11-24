'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '@/lib/api'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Building2, 
  Plus, 
  Edit, 
  Mail, 
  Phone, 
  FileText, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  MapPin,
  Grid3X3,
  List
} from 'lucide-react'
import { DocumentInput } from '@/components/ui/document-input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CEPInput } from '@/components/ui/cep-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { validateDocument, validateDocument2026, isValidCEPFormat } from '@/lib/validation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function OwnersPage() {
  const { hasPermission, user } = useAuth()
  const queryClient = useQueryClient()
  
  // Check permissions
  const canViewUsers = hasPermission('users:read')
  const canCreateUsers = hasPermission('users:create')
  const canUpdateUsers = hasPermission('users:update')
  const canDeleteUsers = hasPermission('users:delete')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Form states
  const [newOwner, setNewOwner] = useState({
    document: '',
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    cep: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
  })
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    birthDate: '',
    address: '',
    cep: '',
    neighborhood: '',
    city: '',
    state: '',
  })
  
  // Other states
  const [selectedOwner, setSelectedOwner] = useState<any>(null)
  const [ownerToDelete, setOwnerToDelete] = useState<any>(null)
  const [ownerDetail, setOwnerDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Don't render if no permission
  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para visualizar proprietários.</p>
        </div>
      </div>
    )
  }

  const { data: owners, isLoading } = useQuery({
    queryKey: ['owners', user?.id, user?.agencyId],
    queryFn: async () => {
      const list = await usersAPI.listUsers({ role: 'PROPRIETARIO', pageSize: 100 })
      return list.items || []
    },
    enabled: canViewUsers,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: true,
  })

  // Helper function to close all modals
  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowDetailModal(false)
    setSelectedOwner(null)
    setOwnerToDelete(null)
  }

  // Create owner
  const createOwnerMutation = useMutation({
    mutationFn: (data: any) => usersAPI.createUser({
      ...data,
      role: 'PROPRIETARIO',
      plan: 'FREE',
      // Owners are independent, no manager or agency association
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      closeAllModals()
      setNewOwner({
        document: '', name: '', phone: '', email: '', birthDate: '', 
        cep: '', address: '', neighborhood: '', city: '', state: ''
      })
      toast.success('Proprietário criado com sucesso')
    },
    onError: (error: any) => {
      console.error('Error creating owner:', error)
      
      // Extract specific error message
      let errorMessage = 'Erro ao criar proprietário'
      
      if (error.message) {
        const message = error.message.toLowerCase()
        
        if (message.includes('already exists') || message.includes('user already exists') || message.includes('email already exists')) {
          errorMessage = 'Este usuário já existe. Verifique o email ou documento.'
        } else if (message.includes('email') && message.includes('invalid')) {
          errorMessage = 'Email inválido. Verifique o formato do email.'
        } else if (message.includes('document') && message.includes('invalid')) {
          errorMessage = 'Documento inválido. Verifique o CPF ou CNPJ.'
        } else if (message.includes('validation')) {
          errorMessage = 'Dados inválidos. Verifique todos os campos obrigatórios.'
        } else if (message.includes('permission') || message.includes('access denied')) {
          errorMessage = 'Sem permissão para criar proprietário.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    },
  })

  // Update owner
  const updateOwnerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      closeAllModals()
      toast.success('Proprietário atualizado com sucesso')
    },
    onError: (error: any) => {
      console.error('Error updating owner:', error)
      
      // Extract specific error message
      let errorMessage = 'Erro ao atualizar proprietário'
      
      if (error.message) {
        const message = error.message.toLowerCase()
        
        if (message.includes('already exists') || message.includes('email already exists')) {
          errorMessage = 'Este email já está sendo usado por outro usuário.'
        } else if (message.includes('email') && message.includes('invalid')) {
          errorMessage = 'Email inválido. Verifique o formato do email.'
        } else if (message.includes('validation')) {
          errorMessage = 'Dados inválidos. Verifique todos os campos.'
        } else if (message.includes('permission') || message.includes('access denied')) {
          errorMessage = 'Sem permissão para atualizar proprietário.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    },
  })

  // Delete owner
  const deleteOwnerMutation = useMutation({
    mutationFn: (id: string) => usersAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      closeAllModals()
      toast.success('Proprietário excluído com sucesso')
    },
    onError: (error: any) => {
      console.error('Error deleting owner:', error)
      const errorMessage = error.message || 'Erro ao excluir proprietário'
      toast.error(errorMessage)
    },
  })

  // Handle form submissions
  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setCreating(true)
    try {
      const enable2026 = process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === 'true' || process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === '1'
      const docResult = enable2026 ? validateDocument2026(newOwner.document) : validateDocument(newOwner.document)
      if (!docResult.isValid) {
        toast.error(docResult.error || 'Documento inválido (CPF/CNPJ)')
        setCreating(false)
        return
      }
      if (!isValidCEPFormat(newOwner.cep)) {
        toast.error('CEP inválido')
        setCreating(false)
        return
      }
      // Default password for owner first login
      const defaultPassword = '123456'
      
      const ownerToSend = {
        ...newOwner,
        password: defaultPassword,
        birthDate: newOwner.birthDate ? new Date(newOwner.birthDate) : null,
      }
      createOwnerMutation.mutate(ownerToSend)
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOwner) return
    setUpdating(true)
    try {
      const enable2026 = process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === 'true' || process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === '1'
      const docResult = enable2026 ? validateDocument2026(editForm.document) : validateDocument(editForm.document)
      if (!docResult.isValid) {
        toast.error(docResult.error || 'Documento inválido (CPF/CNPJ)')
        setUpdating(false)
        return
      }
      if (!isValidCEPFormat(editForm.cep)) {
        toast.error('CEP inválido')
        setUpdating(false)
        return
      }
      const ownerToSend = {
        ...editForm,
        birthDate: editForm.birthDate || undefined,
      }
      updateOwnerMutation.mutate({ id: selectedOwner.id, data: ownerToSend })
    } finally {
      setUpdating(false)
    }
  }

  // CEP auto-fill handlers
  const handleNewOwnerCEPData = useCallback((data: any) => {
    setNewOwner((prev: any) => ({
      ...prev,
      address: data.street || prev.address,
      neighborhood: data.neighborhood || prev.neighborhood,
      city: data.city || prev.city,
      state: data.state || prev.state,
    }))
  }, [])

  const handleEditOwnerCEPData = useCallback((data: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      address: data.street || prev.address,
      neighborhood: data.neighborhood || prev.neighborhood,
      city: data.city || prev.city,
      state: data.state || prev.state,
    }))
  }, [])

  // Handle owner actions
  const handleViewOwner = async (owner: any) => {
    closeAllModals()
    setLoading(true)
    try {
      // Fetch full owner details
      const fullOwnerDetails = await usersAPI.getUserById(owner.id)
      setSelectedOwner(fullOwnerDetails)
      setOwnerDetail(fullOwnerDetails)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Error fetching owner details:', error)
      toast.error('Erro ao carregar detalhes do proprietário')
    } finally {
      setLoading(false)
    }
  }

  const handleEditOwner = async (owner: any) => {
    closeAllModals()
    setLoading(true)
    try {
      // Fetch full owner details
      const fullOwnerDetails = await usersAPI.getUserById(owner.id)
      setSelectedOwner(fullOwnerDetails)
      setEditForm({
        name: fullOwnerDetails.name || '',
        email: fullOwnerDetails.email || '',
        phone: fullOwnerDetails.phone || '',
        document: fullOwnerDetails.document || '',
        birthDate: fullOwnerDetails.birthDate ? fullOwnerDetails.birthDate.split('T')[0] : '',
        address: fullOwnerDetails.address || '',
        cep: fullOwnerDetails.cep || '',
        neighborhood: fullOwnerDetails.neighborhood || '',
        city: fullOwnerDetails.city || '',
        state: fullOwnerDetails.state || '',
      })
      setShowEditModal(true)
    } catch (error) {
      console.error('Error fetching owner details:', error)
      toast.error('Erro ao carregar detalhes do proprietário')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOwner = (owner: any) => {
    closeAllModals()
    setOwnerToDelete(owner)
  }

  const confirmDelete = () => {
    if (ownerToDelete) {
      deleteOwnerMutation.mutate(ownerToDelete.id)
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewOwner(prev => ({ ...prev, [name]: value }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Proprietários</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gerencie todos os proprietários independentes
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* View Toggle Buttons */}
            <div className="flex border border-border rounded-lg p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Visualização em Tabela</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('cards')}
                    className={viewMode === 'cards' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Visualização em Cards</TooltipContent>
              </Tooltip>
            </div>
            
            {canCreateUsers && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none" 
                    onClick={() => {
                      closeAllModals()
                      setShowCreateModal(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Cadastrar Corretor</span>
                    <span className="sm:hidden">Adicionar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cadastrar Corretor</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Owners Display */}
        {owners && owners.length > 0 ? (
          viewMode === 'table' ? (
            /* Table View - Responsive */
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Nome</th>
                      <th className="text-left p-4 font-semibold">Telefone</th>
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Endereço</th>
                      <th className="text-left p-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {owners.map((owner: any) => (
                      <tr key={owner.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{owner.name || 'Sem nome'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">{owner.phone || '-'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">{owner.email || '-'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">
                            {owner.address ? (
                              <>
                                {owner.address}
                                {owner.city && `, ${owner.city}`}
                                {owner.state && ` - ${owner.state}`}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewOwner(owner)}
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                              Detalhes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditOwner(owner)}
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteOwner(owner)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {owners.map((owner: any) => (
                  <div key={owner.id} className="border-b border-border last:border-b-0 p-4">
                    <div className="flex items-start justify-between mb-3 min-w-0 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate" title={owner.name || 'Sem nome'}>{owner.name || 'Sem nome'}</h3>
                        <p className="text-sm text-muted-foreground truncate" title={owner.email || '-'}>{owner.email || '-'}</p>
                      </div>
                      <Badge className="bg-blue-500 text-white text-xs flex-shrink-0">Corretor</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4 min-w-0">
                      {owner.phone && (
                        <div className="flex items-center text-sm text-muted-foreground min-w-0">
                          <span className="font-medium w-20 flex-shrink-0">Telefone:</span>
                          <span className="truncate" title={owner.phone}>{owner.phone}</span>
                        </div>
                      )}
                      {owner.address && (
                        <div className="flex items-start text-sm text-muted-foreground min-w-0">
                          <span className="font-medium w-20 flex-shrink-0">Endereço:</span>
                          <span className="truncate" title={`${owner.address}${owner.city ? `, ${owner.city}` : ''}${owner.state ? ` - ${owner.state}` : ''}`}>
                            {owner.address}
                            {owner.city && `, ${owner.city}`}
                            {owner.state && ` - ${owner.state}`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOwner(owner)}
                        className="text-orange-600 border-orange-600 hover:bg-orange-50 flex-1"
                      >
                        Detalhes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOwner(owner)}
                        className="text-orange-600 border-orange-600 hover:bg-orange-50 flex-1"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteOwner(owner)}
                        className="text-red-600 border-red-600 hover:bg-red-50 flex-1"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Card View */
            <div className="flex justify-center w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-7xl px-2 items-stretch justify-center">
                {owners.map((owner: any) => (
                  <Card key={owner.id} className="transition-all hover:shadow-md flex flex-col w-full max-w-[400px] mx-auto overflow-hidden">
                    <CardContent className="p-0 h-full flex flex-col overflow-hidden min-w-0">
                      <div className="flex h-full min-w-0">
                        {/* Owner Avatar */}
                        <div className="w-28 min-w-28 h-36 bg-primary/10 flex items-center justify-center rounded-l-md flex-shrink-0">
                          <Building2 className="w-12 h-12 text-primary" />
                        </div>
                        {/* Owner Content */}
                        <div className="flex-1 flex flex-col justify-between p-4 min-w-0 overflow-hidden">
                          <div className="min-w-0 space-y-1">
                            <h3 className="text-lg font-bold truncate" title={owner.name || 'Sem nome'}>{owner.name || 'Sem nome'}</h3>
                            <p className="text-sm text-muted-foreground truncate" title={owner.email}>
                              {owner.email}
                            </p>
                            {owner.phone && (
                              <p className="text-xs text-muted-foreground truncate" title={owner.phone}>
                                📞 {owner.phone}
                              </p>
                            )}
                            {owner.document && (
                              <p className="text-xs text-muted-foreground truncate" title={owner.document}>
                                📄 {owner.document}
                              </p>
                            )}
                            {owner.address && (
                              <p className="text-xs text-muted-foreground truncate mt-1" title={`${owner.address}${owner.city ? `, ${owner.city}` : ''}${owner.state ? ` - ${owner.state}` : ''}`}>
                                📍 {owner.address}
                                {owner.city && `, ${owner.city}`}
                                {owner.state && ` - ${owner.state}`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2 gap-2 flex-shrink-0">
                            <div className="min-w-0 flex-shrink"><Badge className="bg-green-500 text-white">Ativo</Badge></div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="outline" className="flex-shrink-0">
                                  <MoreHorizontal className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewOwner(owner)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                {canUpdateUsers && (
                                  <DropdownMenuItem onClick={() => handleEditOwner(owner)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar proprietário
                                  </DropdownMenuItem>
                                )}
                                {canDeleteUsers && (
                                  <DropdownMenuItem onClick={() => handleDeleteOwner(owner)} className="text-red-600 focus:text-red-700">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir proprietário
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Empty State */
          <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-lg px-4">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum proprietário cadastrado</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Comece adicionando seu primeiro proprietário
            </p>
            <Button
              onClick={() => {
                closeAllModals()
                setShowCreateModal(true)
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Corretor
            </Button>
          </div>
        )}

        {/* Create Owner Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Cadastrar Corretor</DialogTitle>
            </DialogHeader>
            <form className="space-y-6" onSubmit={handleCreateOwner}>
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <DocumentInput
                      value={newOwner.document}
                      onChange={(value) => setNewOwner(prev => ({ ...prev, document: value }))}
                      label="Documento"
                      placeholder="000.000.000-00"
                      showValidation={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newOwner.name}
                      onChange={handleInputChange}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newOwner.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newOwner.email}
                      onChange={handleInputChange}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={newOwner.birthDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Endereço</h3>
                </div>
                
                <div>
                  <CEPInput
                    value={newOwner.cep}
                    onChange={(v: string) => setNewOwner((prev: any) => ({ ...prev, cep: v }))}
                    onCEPData={handleNewOwnerCEPData}
                    placeholder="00000-000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newOwner.address}
                    onChange={handleInputChange}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      value={newOwner.neighborhood}
                      onChange={handleInputChange}
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      value={newOwner.city}
                      onChange={handleInputChange}
                      placeholder="São Paulo"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    value={newOwner.state}
                    onChange={handleInputChange}
                    placeholder="SP"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={creating} className="text-orange-600 border-orange-600 hover:bg-orange-50">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white border-0" disabled={creating}>
                  {creating ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Owner Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Editar Corretor</DialogTitle>
            </DialogHeader>
            <form className="space-y-6" onSubmit={handleUpdateOwner}>
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-document">Documento</Label>
                    <Input
                      id="edit-document"
                      name="document"
                      value={editForm.document}
                      onChange={handleEditInputChange}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditInputChange}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditInputChange}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-birthDate">Data de Nascimento</Label>
                  <Input
                    id="edit-birthDate"
                    name="birthDate"
                    type="date"
                    value={editForm.birthDate}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Endereço</h3>
                </div>
                
                <div>
                  <CEPInput
                    value={editForm.cep}
                    onChange={(v: string) => setEditForm((prev: any) => ({ ...prev, cep: v }))}
                    onCEPData={handleEditOwnerCEPData}
                    placeholder="00000-000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Input
                    id="edit-address"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditInputChange}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-neighborhood">Bairro</Label>
                    <Input
                      id="edit-neighborhood"
                      name="neighborhood"
                      value={editForm.neighborhood}
                      onChange={handleEditInputChange}
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">Cidade</Label>
                    <Input
                      id="edit-city"
                      name="city"
                      value={editForm.city}
                      onChange={handleEditInputChange}
                      placeholder="São Paulo"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input
                    id="edit-state"
                    name="state"
                    value={editForm.state}
                    onChange={handleEditInputChange}
                    placeholder="SP"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={updating} className="text-orange-600 border-orange-600 hover:bg-orange-50">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white border-0" disabled={updating}>
                  {updating ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Owner Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Detalhes do Corretor</DialogTitle>
            </DialogHeader>
            {ownerDetail ? (
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <div className="text-base">{ownerDetail.name || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <div className="text-base">{ownerDetail.phone || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="text-base">{ownerDetail.email || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Documento</label>
                      <div className="text-base">{ownerDetail.document || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                      <div className="text-base">
                        {ownerDetail.birthDate ? new Date(ownerDetail.birthDate).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Endereço</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CEP</label>
                      <div className="text-base">{ownerDetail.cep || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                      <div className="text-base">{ownerDetail.address || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                      <div className="text-base">{ownerDetail.neighborhood || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                      <div className="text-base">{ownerDetail.city || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                      <div className="text-base">{ownerDetail.state || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Properties & Tenants Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Imóveis e Inquilinos</h3>
                  </div>

                  {ownerDetail.ownedProperties && ownerDetail.ownedProperties.length > 0 ? (
                    <div className="space-y-3">
                      {ownerDetail.ownedProperties.map((property: any) => (
                        <div key={property.id} className="border border-border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h4 className="text-base font-semibold">{property.name || property.address || 'Imóvel sem nome'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {property.address}
                                {property.city && `, ${property.city}`}
                                {property.state && ` - ${property.state}`}
                              </p>
                            </div>
                            <Badge className="bg-primary/10 text-primary">
                              {property.status || 'Sem status'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div>
                              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Aluguel</span>
                              <span className="text-sm font-semibold">
                                {property.monthlyRent ? formatCurrency(Number(property.monthlyRent)) : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Próximo Vencimento</span>
                              <span className="text-sm font-semibold">
                                {property.nextDueDate ? new Date(property.nextDueDate).toLocaleDateString('pt-BR') : '-'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-border pt-3">
                            <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Inquilino Atual</span>
                            {property.tenant ? (
                              <div className="space-y-1">
                                <div className="text-sm font-medium">{property.tenant.name}</div>
                                <div className="text-xs text-muted-foreground">{property.tenant.email || 'Sem email'}</div>
                                {property.tenant.phone && (
                                  <div className="text-xs text-muted-foreground">{property.tenant.phone}</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">Nenhum inquilino vinculado.</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum imóvel cadastrado para este proprietário.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Não foi possível carregar os detalhes do proprietário.
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!ownerToDelete} onOpenChange={() => setOwnerToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir proprietário</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o proprietário <b>{ownerToDelete?.name}</b>? Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                disabled={deleting} 
                className="bg-destructive hover:bg-destructive/90"
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
