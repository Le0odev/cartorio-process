# Configuração Firebase - Cartório System

## ✅ Serviços que você DEVE habilitar no Console Firebase

### 1. **Authentication** (Obrigatório)
- Acesse: https://console.firebase.google.com/project/cartorio-system/authentication
- Vá em "Sign-in method"
- Habilite **Email/Password**
- Configure domínios autorizados (adicione seu domínio de produção)

### 2. **Firestore Database** (Obrigatório)
- Acesse: https://console.firebase.google.com/project/cartorio-system/firestore
- Se não existir, crie o banco em modo **produção**
- ✅ Regras já foram deployadas automaticamente

### 3. **Cloud Functions** (Recomendado)
- Acesse: https://console.firebase.google.com/project/cartorio-system/functions
- Será habilitado automaticamente quando fizer deploy das functions

### 4. **Realtime Database** (Opcional)
- Acesse: https://console.firebase.google.com/project/cartorio-system/database
- Crie o banco se quiser usar recursos em tempo real
- Suas regras estão em `database.rules.json`

## 🔧 Próximos Passos para Sair dos Mocks

### 1. Criar primeiro usuário admin
```bash
# No console do Firebase Authentication, crie manualmente um usuário
# Email: admin@cartorio.com
# Senha: (defina uma senha segura)
```

### 2. Testar conexão
- Faça login na aplicação
- Tente criar um processo
- Verifique se os dados aparecem no Firestore Console

### 3. Deploy das Functions (se necessário)
```bash
firebase deploy --only functions
```

## 📊 Estrutura de Dados no Firestore

Suas collections serão:
- `processos` - Processos do cartório
- `corretores` - Dados dos corretores
- `assessorias` - Dados das assessorias  
- `naturezas` - Tipos de natureza dos processos

## 🔒 Segurança Configurada

✅ Regras do Firestore deployadas
✅ Apenas usuários autenticados podem ler/escrever
✅ Validações de dados obrigatórios implementadas

## 🚀 Status Atual

- ✅ Firebase CLI instalado e configurado
- ✅ Projeto conectado (cartorio-system)
- ✅ Regras do Firestore deployadas
- ✅ Índices configurados
- ⏳ Aguardando habilitação dos serviços no console