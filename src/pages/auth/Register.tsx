import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../api/auth';
import { DocumentInput } from '@/components/ui/document-input';
import { CEPInput } from '@/components/ui/cep-input';
import { validateDocument, isValidCEPFormat } from '@/lib/validation';

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'INDEPENDENT_OWNER', 
    plan: 'FREE',
    phone: '',
    document: '',
    address: '',
    cep: '',
    neighborhood: '',
    number: '',
    city: '',
    state: '',
    agencyName: '',
    agencyCnpj: '',
  });
  const [step, setStep] = useState<'email' | 'code' | 'details'>('email');
  const [requestId, setRequestId] = useState<string>('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState<number>(0);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [registrationToken, setRegistrationToken] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (step !== 'code') return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCEPData = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      address: data.logradouro || data.street || prev.address,
      neighborhood: data.bairro || data.neighborhood || prev.neighborhood,
      city: data.cidade || data.city || prev.city,
      state: data.estado || data.state || prev.state,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (step === 'email') {
        setRequesting(true);
        const result = await authApi.requestEmailCode(formData.email);
        setRequestId(result.requestId);
        setCooldown(result.cooldownSeconds || 60);
        setStep('code');
        
        if ((result as any).debugCode) {
          console.log(`🔑 Verification code: ${(result as any).debugCode}`);
        }
        toast.success('Código enviado para seu email');
      } else if (step === 'code') {
        setLoading(true);
        const res = await authApi.confirmEmailCode(requestId, code);
        setRegistrationToken(res.registrationToken);
        setStep('details');
        toast.success('Email verificado');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres');
          return;
        }
        
        const docResult = validateDocument(formData.document);
        if (!docResult.isValid) {
          toast.error(docResult.error || 'Documento inválido (CPF/CNPJ)');
          return;
        }
        if (!isValidCEPFormat(formData.cep)) {
          toast.error('CEP inválido');
          return;
        }
        
        if (formData.role === 'AGENCY_ADMIN') {
          if (!formData.agencyName || !formData.agencyCnpj) {
            toast.error('Nome da agência e CNPJ são obrigatórios para proprietários de agência');
            return;
          }
          
          const agencyCnpjResult = validateDocument(formData.agencyCnpj);
          if (!agencyCnpjResult.isValid) {
            toast.error(agencyCnpjResult.error || 'CNPJ da agência inválido');
            return;
          }
        }

        setLoading(true);
        await authApi.completeRegistration({
          registrationToken: registrationToken,
          password: formData.password,
          role: formData.role,
          plan: formData.plan,
          name: formData.name,
          phone: formData.phone,
          document: formData.document,
          address: formData.address,
          cep: formData.cep,
          neighborhood: formData.neighborhood,
          number: formData.number,
          city: formData.city,
          state: formData.state,
          agencyName: formData.agencyName || undefined,
          agencyCnpj: formData.agencyCnpj || undefined,
        });
        toast.success('Conta criada! Faça login');
        navigate('/auth/login');
      }
    } catch (error: any) {
      console.error('Register flow error:', error);
      toast.error(error.response?.data?.message || error.message || 'Erro no registro');
    } finally {
      setLoading(false);
      if (step === 'email') setRequesting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const result = await authApi.requestEmailCode(formData.email);
      setRequestId(result.requestId);
      setCooldown(result.cooldownSeconds || 60);
      
      if ((result as any).debugCode) {
        console.log(`🔑 Verification code: ${(result as any).debugCode}`);
      }
      toast.success('Código reenviado');
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Falha ao reenviar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Criar Conta</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Comece a gerenciar seus aluguéis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {step === 'email' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  placeholder="seu@email.com"
                />
              </div>
            )}

            {step === 'code' && (
              <div>
                <label className="block text-sm font-medium mb-2">Digite o código recebido</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base tracking-widest text-center"
                  placeholder="000000"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Enviado para {formData.email}</span>
                  <button
                    type="button"
                    disabled={cooldown > 0}
                    onClick={handleResendCode}
                    className="text-primary disabled:opacity-50"
                  >
                    Reenviar {cooldown > 0 ? `(${cooldown}s)` : ''}
                  </button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  placeholder="Seu nome"
                />
              </div>
            )}

            {step === 'details' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email-readonly"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  readOnly
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-base opacity-80 cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
            )}

            {step === 'details' && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Tipo de Conta
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                >
                  {}
                  <option value="INDEPENDENT_OWNER">Imóvel Independente - Gerenciar meus imóveis sem agência</option>
                  <option value="AGENCY_ADMIN">Diretor de Agência - Criar minha imobiliária</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.role === 'INDEPENDENT_OWNER' &&
                    'Como Imóvel Independente, você poderá gerenciar seus próprios imóveis, inquilinos e contratos.'}
                  {formData.role === 'AGENCY_ADMIN' &&
                    'Como Diretor de Agência, você poderá criar sua imobiliária e gerenciar corretores, imóveis e inquilinos.'}
                </p>
              </div>
            )}

            {step === 'details' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 pr-10 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 pr-10 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  placeholder="(11) 99999-9999"
                />
              </div>
            )}

            {step === 'details' && (
              <div>
                <DocumentInput
                  value={formData.document}
                  onChange={(value) => setFormData(prev => ({ ...prev, document: value }))}
                  label="CPF/CNPJ"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  showValidation={true}
                />
              </div>
            )}

            {step === 'details' && (
              <div>
                <CEPInput
                  value={formData.cep}
                  onChange={(value) => setFormData(prev => ({ ...prev, cep: value }))}
                  onCEPData={handleCEPData}
                  label="CEP"
                  placeholder="00000-000"
                />
              </div>
            )}

            {step === 'details' && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                  Endereço
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  placeholder="Rua, Avenida, etc."
                />
              </div>
            )}

            {step === 'details' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium mb-2">
                    Número
                  </label>
                  <input
                    id="number"
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium mb-2">
                    Bairro
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    placeholder="Centro"
                  />
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2">
                    Cidade
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-2">
                    Estado
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    placeholder="SP"
                  />
                </div>
              </div>
            )}

            {}
            {step === 'details' && formData.role === 'AGENCY_ADMIN' && (
              <>
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Informações da Agência</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    As informações da agência serão criadas automaticamente com base nos seus dados pessoais.
                  </p>
                </div>

                <div>
                  <label htmlFor="agencyName" className="block text-sm font-medium mb-2">
                    Nome da Agência <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="agencyName"
                    type="text"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    placeholder="Ex: Imobiliária Central"
                  />
                </div>

                <div>
                  <DocumentInput
                    value={formData.agencyCnpj}
                    onChange={(value) => setFormData(prev => ({ ...prev, agencyCnpj: value }))}
                    label="CNPJ da Agência"
                    placeholder="00.000.000/0000-00"
                    showValidation={true}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    O CNPJ da agência será usado para identificação legal
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (step === 'email' && requesting)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 text-base"
            >
              {step === 'email' && (requesting ? 'Enviando...' : 'Enviar código')}
              {step === 'code' && (loading ? 'Verificando...' : 'Confirmar código')}
              {step === 'details' && (loading ? 'Criando conta...' : 'Criar conta')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-primary hover:underline"
            >
              Já tem uma conta? Faça login
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Ao criar uma conta, você concorda com nossos{' '}
          <Link
            to="/terms"
            className="text-primary hover:underline"
          >
            Termos de Uso e Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
