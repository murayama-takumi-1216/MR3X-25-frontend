'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsAPI } from '@/lib/api'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function NotificationsPage() {
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  
  // Check permissions
  const canViewNotifications = hasPermission('notifications:read')
  const canCreateNotifications = hasPermission('notifications:create')
  const canUpdateNotifications = hasPermission('notifications:update')
  const canDeleteNotifications = hasPermission('notifications:delete')
  
  // Don't render if no permission
  if (!canViewNotifications) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view notifications.</p>
        </div>
      </div>
    )
  }
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Form states
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'PAYMENT_REMINDER',
    daysBefore: '',
    isActive: true,
    channels: ['EMAIL', 'WHATSAPP'],
  })
  
  const [editForm, setEditForm] = useState({
    title: '',
    message: '',
    type: 'PAYMENT_REMINDER',
    daysBefore: '',
    isActive: true,
    channels: ['EMAIL', 'WHATSAPP'],
  })
  
  // Other states
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [notificationToDelete, setNotificationToDelete] = useState<any>(null)
  const [notificationDetail, setNotificationDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getNotifications(),
    enabled: canViewNotifications,
  })

  // Helper function to close all modals
  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowDetailModal(false)
    setSelectedNotification(null)
    setNotificationToDelete(null)
  }

  // Create notification
  const createNotificationMutation = useMutation({
    mutationFn: (data: any) => notificationsAPI.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      closeAllModals()
      setNewNotification({
        title: '', message: '', type: 'PAYMENT_REMINDER', 
        daysBefore: '', isActive: true, channels: ['EMAIL', 'WHATSAPP']
      })
      toast.success('Notificação criada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar notificação')
    },
  })

  // Update notification
  const updateNotificationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => notificationsAPI.updateNotification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      closeAllModals()
      toast.success('Notificação atualizada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar notificação')
    },
  })

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      closeAllModals()
      toast.success('Notificação excluída com sucesso')
    },
    onError: () => {
      toast.error('Erro ao excluir notificação')
    },
  })

  // Handle form submissions
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const notificationToSend = {
        ...newNotification,
        daysBefore: Number(newNotification.daysBefore),
      }
      createNotificationMutation.mutate(notificationToSend)
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNotification) return
    setUpdating(true)
    try {
      const notificationToSend = {
        ...editForm,
        daysBefore: Number(editForm.daysBefore),
      }
      updateNotificationMutation.mutate({ id: selectedNotification.id, data: notificationToSend })
    } finally {
      setUpdating(false)
    }
  }

  // Handle notification actions
  const handleViewNotification = async (notification: any) => {
    closeAllModals()
    setSelectedNotification(notification)
    setNotificationDetail(notification)
    setShowDetailModal(true)
  }

  const handleEditNotification = (notification: any) => {
    closeAllModals()
    setSelectedNotification(notification)
    setEditForm({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'PAYMENT_REMINDER',
      daysBefore: notification.daysBefore?.toString() || '',
      isActive: notification.isActive ?? true,
      channels: notification.channels || ['EMAIL', 'WHATSAPP'],
    })
    setShowEditModal(true)
  }

  const handleDeleteNotification = (notification: any) => {
    closeAllModals()
    setNotificationToDelete(notification)
  }

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotificationMutation.mutate(notificationToDelete.id)
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setNewNotification(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'channels') {
      const target = e.target as HTMLInputElement
      const channels = target.checked 
        ? [...newNotification.channels, value]
        : newNotification.channels.filter((c: string) => c !== value)
      setNewNotification(prev => ({ ...prev, channels }))
    } else {
      setNewNotification(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setEditForm(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'channels') {
      const target = e.target as HTMLInputElement
      const channels = target.checked 
        ? [...editForm.channels, value]
        : editForm.channels.filter((c: string) => c !== value)
      setEditForm(prev => ({ ...prev, channels }))
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // Notification type badge component
  const getNotificationTypeBadge = (type: string) => {
    switch (type) {
      case 'PAYMENT_REMINDER':
        return <Badge className="bg-blue-500 text-white">Lembrete de Pagamento</Badge>
      case 'PAYMENT_OVERDUE':
        return <Badge className="bg-red-500 text-white">Pagamento em Atraso</Badge>
      case 'CONTRACT_EXPIRY':
        return <Badge className="bg-yellow-500 text-white">Contrato Expirando</Badge>
      case 'GENERAL':
        return <Badge className="bg-gray-500 text-white">Geral</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{type}</Badge>
    }
  }

  // Channel icon component
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="w-4 h-4" />
      case 'WHATSAPP':
        return <MessageSquare className="w-4 h-4" />
      case 'SMS':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Notificações</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Configure alertas automáticos e gerencie comunicações
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground" 
                onClick={() => {
                  closeAllModals()
                  setShowCreateModal(true)
                }}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Criar Notificação</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex justify-center w-full">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 w-full max-w-7xl px-2 items-stretch justify-center">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <Card key={notification.id} className="transition-all hover:shadow-md flex flex-col w-[400px] mx-auto overflow-hidden">
                  <CardContent className="p-0 h-full flex flex-col overflow-hidden">
                    <div className="flex h-full">
                      {/* Notification Icon */}
                      <div className="w-28 min-w-28 h-36 bg-primary/10 flex items-center justify-center rounded-l-md">
                        <Bell className="w-12 h-12 text-primary" />
                      </div>
                      {/* Notification Content */}
                      <div className="flex-1 flex flex-col justify-between p-4">
                        <div>
                          <h3 className="text-lg font-bold break-words">{notification.title || 'Notificação'}</h3>
                          <p className="text-sm text-muted-foreground break-words mt-1">
                            {notification.message || 'Sem descrição'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {getNotificationTypeBadge(notification.type)}
                            {notification.isActive ? (
                              <Badge className="bg-green-500 text-white">Ativa</Badge>
                            ) : (
                              <Badge className="bg-gray-500 text-white">Inativa</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {notification.daysBefore} dias antes
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {notification.channels?.map((channel: string) => (
                              <div key={channel} className="flex items-center gap-1">
                                {getChannelIcon(channel)}
                                <span className="text-xs text-muted-foreground">{channel}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-muted-foreground">
                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('pt-BR') : ''}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="outline">
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewNotification(notification)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              {canUpdateNotifications && (
                                <DropdownMenuItem onClick={() => handleEditNotification(notification)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar notificação
                                </DropdownMenuItem>
                              )}
                              {canDeleteNotifications && (
                                <DropdownMenuItem onClick={() => handleDeleteNotification(notification)} className="text-red-600 focus:text-red-700">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir notificação
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-lg px-4 col-span-full">
                <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma notificação configurada</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Configure alertas para pagamentos e vencimentos
                </p>
                {canCreateNotifications && (
                  <Button
                    onClick={() => {
                      closeAllModals()
                      setShowCreateModal(true)
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Configurar Notificação
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Notification Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar nova notificação</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateNotification}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newNotification.title}
                    onChange={handleInputChange}
                    placeholder="Título da notificação"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    name="type"
                    value={newNotification.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-input rounded-md"
                    required
                  >
                    <option value="PAYMENT_REMINDER">Lembrete de Pagamento</option>
                    <option value="PAYMENT_OVERDUE">Pagamento em Atraso</option>
                    <option value="CONTRACT_EXPIRY">Contrato Expirando</option>
                    <option value="GENERAL">Geral</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <textarea
                  id="message"
                  name="message"
                  value={newNotification.message}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-input rounded-md min-h-[100px] resize-none"
                  placeholder="Mensagem da notificação"
                  required
                />
              </div>

              <div>
                <Label htmlFor="daysBefore">Dias antes do evento</Label>
                <Input
                  id="daysBefore"
                  name="daysBefore"
                  type="number"
                  min="0"
                  value={newNotification.daysBefore}
                  onChange={handleInputChange}
                  placeholder="5"
                  required
                />
              </div>

              <div>
                <Label>Canais de envio</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="channels"
                      value="EMAIL"
                      checked={newNotification.channels.includes('EMAIL')}
                      onChange={handleInputChange}
                    />
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="channels"
                      value="WHATSAPP"
                      checked={newNotification.channels.includes('WHATSAPP')}
                      onChange={handleInputChange}
                    />
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">WhatsApp</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={newNotification.isActive}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm">Notificação ativa</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={creating}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Notification Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar notificação</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleUpdateNotification}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Título</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditInputChange}
                    placeholder="Título da notificação"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Tipo</Label>
                  <select
                    id="edit-type"
                    name="type"
                    value={editForm.type}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-input rounded-md"
                    required
                  >
                    <option value="PAYMENT_REMINDER">Lembrete de Pagamento</option>
                    <option value="PAYMENT_OVERDUE">Pagamento em Atraso</option>
                    <option value="CONTRACT_EXPIRY">Contrato Expirando</option>
                    <option value="GENERAL">Geral</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-message">Mensagem</Label>
                <textarea
                  id="edit-message"
                  name="message"
                  value={editForm.message}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-input rounded-md min-h-[100px] resize-none"
                  placeholder="Mensagem da notificação"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-daysBefore">Dias antes do evento</Label>
                <Input
                  id="edit-daysBefore"
                  name="daysBefore"
                  type="number"
                  min="0"
                  value={editForm.daysBefore}
                  onChange={handleEditInputChange}
                  placeholder="5"
                  required
                />
              </div>

              <div>
                <Label>Canais de envio</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="channels"
                      value="EMAIL"
                      checked={editForm.channels.includes('EMAIL')}
                      onChange={handleEditInputChange}
                    />
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="channels"
                      value="WHATSAPP"
                      checked={editForm.channels.includes('WHATSAPP')}
                      onChange={handleEditInputChange}
                    />
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">WhatsApp</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleEditInputChange}
                  />
                  <span className="text-sm">Notificação ativa</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={updating}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={updating}>
                  {updating ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notification Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Notificação</DialogTitle>
            </DialogHeader>
            {notificationDetail ? (
              <div className="space-y-2">
                <div><b>Título:</b> {notificationDetail.title || '-'}</div>
                <div><b>Mensagem:</b> {notificationDetail.message || '-'}</div>
                <div><b>Tipo:</b> {getNotificationTypeBadge(notificationDetail.type)}</div>
                <div><b>Dias antes:</b> {notificationDetail.daysBefore}</div>
                <div><b>Status:</b> {notificationDetail.isActive ? <Badge className="bg-green-500 text-white">Ativa</Badge> : <Badge className="bg-gray-500 text-white">Inativa</Badge>}</div>
                <div><b>Canais:</b> {notificationDetail.channels?.join(', ') || '-'}</div>
                <div><b>Criada em:</b> {notificationDetail.createdAt ? new Date(notificationDetail.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Não foi possível carregar os detalhes da notificação.
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!notificationToDelete} onOpenChange={() => setNotificationToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir notificação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta notificação? Esta ação não poderá ser desfeita.
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

