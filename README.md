# Sistema de Escrituras Cartorárias

Sistema web completo para controle e gerenciamento de escrituras cartorárias, baseado em planilha Excel existente. Desenvolvido com Next.js 14, TypeScript e Firebase.

## 🎯 Objetivo

Construir um sistema fiel à planilha de controle de escrituras, onde cada processo pode ser criado, visualizado, atualizado e monitorado em tempo real, mantendo a mesma nomenclatura e estrutura dos dados originais.

## 🧩 Stack Tecnológica

- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS + shadcn/ui
- **Backend**: Firebase (Firestore, Realtime Database, Auth, Cloud Functions)
- **Validação**: Zod
- **Estado Global**: Zustand
- **Estilização**: TailwindCSS com sistema de design consistente

## 🏗️ Arquitetura

### Firebase Services
- **Firestore**: Dados persistentes dos processos, corretores, assessorias e naturezas
- **Realtime Database**: Métricas, totais e indicadores em tempo real
- **Authentication**: Controle de acesso e autenticação de usuários
- **Cloud Functions**: Cálculos automáticos, logs e eventos do sistema

### Estrutura de Dados

#### Coleção Principal: `processos`
```typescript
interface Processo {
  id?: string;
  talao: string;
  status_pgto: string;
  status_escritura: string;
  rgi_entrega: string;
  natureza: string;
  edificio_adquirente_responsavel: string;
  valor_emolumentos: number;
  corretor: string;
  assessoria: string;
  numero_sicase: string;
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
  historico?: HistoricoItem[];
}
```

#### Coleções Auxiliares
- `corretores`: Dados dos corretores (nome, contato, status)
- `assessorias`: Dados das assessorias (nome, contato, endereço)
- `naturezas`: Tipos de natureza dos processos

#### Realtime Database - Indicadores
```typescript
interface Indicadores {
  total_processos: number;
  total_emolumentos: number;
  total_pago: number;
  total_pendente: number;
  processos_por_status: Record<string, number>;
  processos_por_corretor: Record<string, number>;
  processos_por_assessoria: Record<string, number>;
  processos_por_natureza: Record<string, number>;
  ultima_atualizacao: string;
}
```

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/login/            # Páginas de autenticação
│   ├── (dashboard)/             # Páginas do dashboard
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── processos/           # Gestão de processos
│   │   └── layout.tsx           # Layout do dashboard
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout raiz
│   └── page.tsx                 # Página inicial
├── modules/                     # Módulos de negócio
│   ├── processos/               # Módulo de processos
│   │   ├── hooks/               # Hooks personalizados
│   │   ├── service/             # Serviços Firebase
│   │   └── types.ts             # Tipos TypeScript
│   ├── corretores/              # Módulo de corretores
│   ├── assessorias/             # Módulo de assessorias
│   └── naturezas/               # Módulo de naturezas
├── lib/                         # Configurações e utilitários
│   ├── firebase/                # Configuração Firebase
│   └── utils.ts                 # Utilitários gerais
├── components/                  # Componentes React
│   ├── ui/                      # Componentes de UI (shadcn/ui)
│   └── shared/                  # Componentes compartilhados
├── contexts/                    # Contextos React
├── store/                       # Estado global (Zustand)
└── utils/                       # Utilitários e helpers
```

## 🚀 Configuração e Instalação

### 1. Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Firebase

### 2. Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd sistema-escrituras-cartorarias

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

### 3. Configuração do Firebase

#### 3.1. Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative Authentication, Firestore e Realtime Database

#### 3.2. Configurar Authentication
1. No Firebase Console, vá em Authentication > Sign-in method
2. Ative "Email/Password"

#### 3.3. Configurar Firestore
1. Crie o banco Firestore em modo de produção
2. Configure as regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 3.4. Configurar Realtime Database
1. Crie o Realtime Database
2. Configure as regras:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 4. Variáveis de Ambiente

Edite o arquivo `.env.local` com suas configurações do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
```

### 5. Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

## 🔧 Funcionalidades Implementadas

### ✅ Autenticação
- Login/logout com Firebase Auth
- Proteção de rotas
- Contexto de autenticação

### ✅ CRUD Completo
- **Processos**: Criar, ler, atualizar, deletar
- **Corretores**: Gestão completa
- **Assessorias**: Gestão completa  
- **Naturezas**: Gestão completa

### ✅ Tempo Real
- Atualizações automáticas via Firestore listeners
- Indicadores em tempo real via Realtime Database
- Sincronização automática entre usuários

### ✅ Dashboard
- Métricas principais (totais, valores)
- Gráficos de distribuição
- Indicadores por status, corretor, assessoria

### ✅ Estrutura Modular
- Arquitetura escalável
- Separação de responsabilidades
- Hooks personalizados para cada módulo
- Serviços especializados (Firestore, Realtime, Functions)

## 🔄 Fluxos do Sistema

### 1. Criação de Processo
1. Usuário preenche formulário
2. Validação com Zod
3. Salva no Firestore
4. Trigger Cloud Function para atualizar indicadores
5. Log da atividade no histórico
6. Atualização automática da UI

### 2. Atualização de Indicadores
1. Cloud Function detecta mudança no Firestore
2. Recalcula totais e métricas
3. Atualiza Realtime Database
4. Dashboard atualiza automaticamente

### 3. Autenticação
1. Login via Firebase Auth
2. Redirecionamento baseado no estado de auth
3. Proteção de rotas do dashboard

## 🎨 Próximos Passos (Interface Visual)

O sistema está preparado para receber as telas visuais. A estrutura atual inclui:

- ✅ Componentes de UI básicos (shadcn/ui)
- ✅ Sistema de roteamento completo
- ✅ Hooks e serviços prontos
- ✅ Validações e tipos TypeScript
- ✅ Estado global configurado

### Para adicionar novas telas:
1. Criar componentes na pasta `src/components/`
2. Utilizar os hooks existentes (`useProcessos`, `useCorretores`, etc.)
3. Aproveitar os serviços já configurados
4. Seguir o padrão de design estabelecido

## 🛠️ Desenvolvimento

### Comandos Úteis
```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint
```

### Estrutura de Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes

## 📝 Licença

Este projeto é privado e destinado ao uso interno da organização.

---

**Sistema de Escrituras Cartorárias** - Versão 1.0.0
Desenvolvido com ❤️ usando Next.js e Firebase