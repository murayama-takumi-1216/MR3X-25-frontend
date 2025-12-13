import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  User, Mail, Phone, FileText, MapPin, Shield, Camera, Trash2, Lock, Eye, EyeOff, Save, Loader2, Building2, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { profileAPI } from '../../api';
import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// Get base URL without /api suffix for static files
const getStaticBaseUrl = () => {
  const url = API_BASE_URL;
  return url.endsWith('/api') ? url.slice(0, -4) : url;
};

export default function MyAccount() {
  const { user } = useAuth();
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    document: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Helper function to get full photo URL
  const getPhotoUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return undefined;
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${getStaticBaseUrl()}${photoUrl}`;
  };

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileAPI.getProfile,
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        document: profile.document || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileAPI.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUser({ name: data.name });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar perfil');
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: profileAPI.uploadPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Foto atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao fazer upload da foto');
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: profileAPI.deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Foto removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover foto');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: profileAPI.changePassword,
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Senha alterada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar senha');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A foto deve ter no máximo 5MB');
        return;
      }
      uploadPhotoMutation.mutate(file);
    }
  };

  const handleDeletePhoto = () => {
    setShowDeleteModal(true);
  };

  const confirmDeletePhoto = () => {
    deletePhotoMutation.mutate();
    setShowDeleteModal(false);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      CEO: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
      AGENCY_ADMIN: 'bg-indigo-100 text-indigo-800',
      AGENCY_MANAGER: 'bg-blue-100 text-blue-800',
      BROKER: 'bg-yellow-100 text-yellow-800',
      INDEPENDENT_OWNER: 'bg-emerald-100 text-emerald-800',
      PROPRIETARIO: 'bg-green-100 text-green-800',
      INQUILINO: 'bg-orange-100 text-orange-800',
      BUILDING_MANAGER: 'bg-cyan-100 text-cyan-800',
      LEGAL_AUDITOR: 'bg-gray-100 text-gray-800',
      REPRESENTATIVE: 'bg-pink-100 text-pink-800',
      PLATFORM_MANAGER: 'bg-teal-100 text-teal-800',
      API_CLIENT: 'bg-slate-100 text-slate-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      CEO: 'CEO',
      ADMIN: 'Administrador',
      AGENCY_ADMIN: 'Diretor de Agência',
      AGENCY_MANAGER: 'Gerente de Agência',
      BROKER: 'Corretor',
      INDEPENDENT_OWNER: 'Proprietário Independente',
      PROPRIETARIO: 'Proprietário',
      INQUILINO: 'Inquilino',
      BUILDING_MANAGER: 'Síndico',
      LEGAL_AUDITOR: 'Auditor Legal',
      REPRESENTATIVE: 'Representante',
      PLATFORM_MANAGER: 'Gerente de Plataforma',
      API_CLIENT: 'Cliente API',
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={getPhotoUrl(profile?.photoUrl)} alt={profile?.name || user?.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {(profile?.name || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                  disabled={uploadPhotoMutation.isPending}
                >
                  {uploadPhotoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="space-y-1 text-center">
                <CardTitle className="text-xl">{profile?.name || user?.name || 'Usuário'}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </CardDescription>
              </div>

              <Badge className={getRoleBadgeColor(user?.role || '')}>
                <Shield className="h-3 w-3 mr-1" />
                {getRoleLabel(user?.role || '')}
              </Badge>

              {profile?.photoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeletePhoto}
                  disabled={deletePhotoMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  {deletePhotoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Remover Foto
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="space-y-3 text-sm">
              {user?.agencyId && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Agência vinculada</span>
                </div>
              )}
              {user?.creci && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>CRECI: {user.creci}</span>
                </div>
              )}
              {user?.plan && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Plano: {user.plan}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados Pessoais
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Segurança
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        O e-mail não pode ser alterado
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CPF/CNPJ
                      </Label>
                      <Input
                        id="document"
                        value={formData.document}
                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Seu endereço completo"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Senha Atual
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Digite sua senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Digite sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A senha deve ter no mínimo 6 caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirme sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Alterar Senha
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Photo Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Foto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover sua foto de perfil? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePhoto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePhotoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removendo...
                </>
              ) : (
                'Remover'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
