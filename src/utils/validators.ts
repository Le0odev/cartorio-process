import { z } from 'zod';

// Schema para validação de processo
export const processoSchema = z.object({
  talao: z.string().min(1, 'Talão é obrigatório'),
  statusPagamento: z.enum(['Pago', 'A gerar', 'Gerado', 'Não enviado'], {
    errorMap: () => ({ message: 'Status de pagamento inválido' })
  }),
  statusEscritura: z.enum(['Pronta', 'Lavrada', 'Em tramitação', 'Enviada', 'Inventário', 'Não enviado'], {
    errorMap: () => ({ message: 'Status da escritura inválido' })
  }),
  rgiEntrega: z.string().min(1, 'RGI/Entrega é obrigatório'),
  natureza: z.string().min(1, 'Natureza é obrigatória'),
  edificioAdquirenteResponsavel: z.string().min(1, 'Edifício/Adquirente/Responsável é obrigatório'),
  valorEmolumentos: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  valorCorretor: z.number().min(0, 'Valor do corretor deve ser maior ou igual a zero'),
  valorAssessoria: z.number().min(0, 'Valor da assessoria deve ser maior ou igual a zero'),
  numeroSicase: z.string().min(1, 'Número SICASE é obrigatório').refine(
    (val) => val.length >= 3,
    { message: 'Número SICASE deve ter pelo menos 3 caracteres' }
  ),
});

// Schema para novo processo com valores padrão
export const novoProcessoSchema = z.object({
  talao: z.string().optional(), // Será gerado automaticamente
  statusPagamento: z.enum(['Pago', 'A gerar', 'Gerado', 'Não enviado']).default('A gerar'),
  statusEscritura: z.enum(['Pronta', 'Lavrada', 'Em tramitação', 'Enviada', 'Inventário', 'Não enviado']).default('Em tramitação'),
  rgiEntrega: z.string().min(1, 'RGI/Entrega é obrigatório'),
  natureza: z.string().min(1, 'Natureza é obrigatória'),
  edificioAdquirenteResponsavel: z.string().min(1, 'Edifício/Adquirente/Responsável é obrigatório'),
  valorEmolumentos: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  valorCorretor: z.number().min(0, 'Valor do corretor deve ser maior ou igual a zero'),
  valorAssessoria: z.number().min(0, 'Valor da assessoria deve ser maior ou igual a zero'),
  numeroSicase: z.string().min(3, 'Número SICASE deve ter pelo menos 3 caracteres'),
});

// Schema para validação de corretor
export const corretorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  contato: z.string().min(1, 'Contato é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  status: z.enum(['ativo', 'inativo']),
});

// Schema para validação de assessoria
export const assessoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  contato: z.string().min(1, 'Contato é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  endereco: z.string().optional(),
});

// Schema para validação de natureza
export const naturezaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

// Schema para validação de filtros
export const filtrosSchema = z.object({
  status_pgto: z.string().optional(),
  status_escritura: z.string().optional(),
  corretor: z.string().optional(),
  assessoria: z.string().optional(),
  natureza: z.string().optional(),
  data_inicio: z.date().optional(),
  data_fim: z.date().optional(),
  valor_min: z.number().min(0).optional(),
  valor_max: z.number().min(0).optional(),
});

// Schema para autenticação
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  displayName: z.string().min(1, 'Nome é obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type ProcessoFormData = z.infer<typeof processoSchema>;
export type CorretorFormData = z.infer<typeof corretorSchema>;
export type AssessoriaFormData = z.infer<typeof assessoriaSchema>;
export type NaturezaFormData = z.infer<typeof naturezaSchema>;
export type FiltrosFormData = z.infer<typeof filtrosSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;