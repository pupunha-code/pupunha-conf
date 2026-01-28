# 🎤 Pupunha Conf

![pupunhasdsds](https://github.com/user-attachments/assets/f54bf35e-49d3-420f-b8c1-130501ed0bb8)

App mobile para conferências e meetups do Pupunha Code. Desenvolvido com React Native e Expo.

**Altamente** baseado pelos apps da **Codecon** e do **React Conf**.

https://github.com/expo/react-conf-app

> 🇺🇸 **Read in English:** [README.md](./README.md)

---

## 📖 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Início Rápido](#-início-rápido)
- [Configuração de Variáveis de Ambiente](#-configuração-de-variáveis-de-ambiente)
- [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
- [Executando o App](#-executando-o-app)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Solução de Problemas](#-solução-de-problemas)

---

## ✨ Funcionalidades

- 📅 **Calendário de Eventos** - Navegue por sessões organizadas por dia
- 👥 **Palestrantes** - Perfis com avatares do GitHub, biografias e links sociais
- 📝 **Detalhes das Sessões** - Informações completas sobre palestras e workshops
- 🔖 **Favoritos** - Salve sessões favoritas para acesso rápido
- 📱 **Feed Social** - Compartilhe posts e imagens com a comunidade
- 🌓 **Modo Escuro** - Suporte automático a tema claro/escuro
- 📱 **Multiplataforma** - iOS, Android e Web

---

## 🛠️ Tecnologias

- **Expo** ~54.0
- **React Native** 0.81.5
- **React** 19.1.0
- **TypeScript**
- **Zustand** (gerenciamento de estado)
- **Expo Router** (roteamento baseado em arquivos)
- **Supabase** (backend e autenticação)
- **React Query** (busca de dados)

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:

### Obrigatório

- **[Bun](https://bun.sh)** (v1.0 ou superior) - Gerenciador de pacotes e runtime
  - Instalar: `curl -fsSL https://bun.sh/install | bash`
  - Ou use npm: `npm install -g bun`
- **[Node.js](https://nodejs.org/)** (v18 ou superior) - Necessário para Expo
- **[Git](https://git-scm.com/)** - Controle de versão

### Para Desenvolvimento Mobile

**iOS (apenas macOS):**

- [Xcode](https://developer.apple.com/xcode/) (versão mais recente)
- iOS Simulator (vem com Xcode)
- [CocoaPods](https://cocoapods.org/) - Instalar: `sudo gem install cocoapods`

**Android:**

- [Android Studio](https://developer.android.com/studio)
- Android SDK (instalado via Android Studio)
- Android Emulator (configurado via Android Studio)

**Web:**

- Qualquer navegador moderno (Chrome, Firefox, Safari, Edge)

### Opcional

- App [Expo Go](https://expo.dev/client) no seu celular para testes rápidos
- [EAS CLI](https://docs.expo.dev/build/introduction/) para builds de produção

---

## 🚀 Início Rápido

### 1. Clone o Repositório

```bash
git clone https://github.com/pupunha-code/pupunha-conf
cd pupunha-conf
```

### 2. Instale as Dependências

```bash
bun install
```

> **Nota:** Se você não tiver Bun instalado, pode usar npm:
>
> ```bash
> npm install
> ```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Depois edite o `.env` e preencha os valores de configuração (veja [Configuração de Variáveis de Ambiente](#-configuração-de-variáveis-de-ambiente) abaixo).

### 4. Configure o Banco de Dados Supabase

Execute o schema SQL no seu projeto Supabase (veja [Configuração do Banco de Dados](#-configuração-do-banco-de-dados) abaixo).

### 5. Inicie o Servidor de Desenvolvimento

```bash
bun run start
```

Isso iniciará o servidor de desenvolvimento Expo. Você pode então:

- Pressionar `i` para abrir o simulador iOS
- Pressionar `a` para abrir o emulador Android
- Pressionar `w` para abrir no navegador web
- Escanear o código QR com o app Expo Go no seu celular

---

## 🔧 Configuração de Variáveis de Ambiente

O app requer várias variáveis de ambiente para funcionar corretamente. Crie um arquivo `.env` no diretório raiz baseado em `.env.example`.

### Variáveis Obrigatórias

#### Configuração do Supabase

1. **Crie um projeto Supabase:**
   - Acesse [supabase.com](https://supabase.com)
   - Faça login ou crie uma conta
   - Crie um novo projeto
   - Aguarde o projeto terminar de configurar

2. **Obtenha suas credenciais do Supabase:**
   - Vá em Configurações do Projeto → API
   - Copie sua **URL do Projeto** (esta é sua `EXPO_PUBLIC_SUPABASE_URL`)
   - Copie sua **chave anon/public** (esta é sua `EXPO_PUBLIC_SUPABASE_ANON_KEY`)

3. **Adicione ao `.env`:**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

#### Configuração do Google OAuth

1. **Crie um projeto no Google Cloud:**
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um novo projeto ou selecione um existente
   - Ative a API do Google+

2. **Crie credenciais OAuth 2.0:**
   - Vá em APIs e Serviços → Credenciais
   - Clique em "Criar credenciais" → "ID do cliente OAuth"
   - Crie credenciais para:
     - **Aplicativo Web** → Copie o ID do Cliente
     - **iOS** → Copie o ID do Cliente (requer bundle ID: `com.pupunhaconf.app`)
     - **Android** → Copie o ID do Cliente (requer nome do pacote: `com.pupunhaconf.app`)

3. **Adicione ao `.env`:**
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu-web-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=seu-ios-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=seu-android-client-id.apps.googleusercontent.com
   ```

### Variáveis Opcionais

#### LogRocket (Analytics)

Se você quiser usar LogRocket para rastreamento de erros e analytics:

1. Cadastre-se em [logrocket.com](https://logrocket.com)
2. Crie um novo projeto
3. Copie seu App ID
4. Adicione ao `.env`:
   ```env
   EXPO_PUBLIC_LOGROCKET_APP_ID=seu-logrocket-app-id
   ```

#### Versão do App

```env
EXPO_PUBLIC_APP_VERSION=1.0.0
```

---

## 🗄️ Configuração do Banco de Dados

O app usa Supabase para armazenamento de dados e autenticação. Você precisa configurar o schema do banco de dados.

### Passos

1. **Abra seu projeto Supabase**
2. **Vá para o Editor SQL** (na barra lateral esquerda)
3. **Copie e cole o conteúdo de `supabase-schema.sql`**
4. **Clique em "Executar"** para executar o SQL

Isso criará:

- Tabela `profiles` - Perfis de usuários
- Tabela `feed_posts` - Posts do feed social
- Bucket de storage para imagens
- Políticas de Row Level Security (RLS)
- Triggers para criação automática de perfil

### Verificar Configuração

Após executar o SQL, verifique:

- Tabelas criadas: Vá em Editor de Tabelas → Verifique `profiles` e `feed_posts`
- Bucket de storage existe: Vá em Storage → Verifique bucket `feed-images`
- RLS está habilitado: Verifique configurações da tabela

---

## 💻 Executando o App

### Modo de Desenvolvimento

Inicie o servidor de desenvolvimento Expo:

```bash
bun run start
```

Isso abre o Expo DevTools. Você pode então:

- **Simulador iOS** (apenas macOS):

  ```bash
  bun run ios
  ```

  Ou pressione `i` no Expo DevTools

- **Emulador Android**:

  ```bash
  bun run android
  ```

  Ou pressione `a` no Expo DevTools

- **Navegador Web**:

  ```bash
  bun run web
  ```

  Ou pressione `w` no Expo DevTools

- **Dispositivo Físico**:
  - Instale o [Expo Go](https://expo.dev/client) no seu celular
  - Escaneie o código QR mostrado no terminal/Expo DevTools
  - Certifique-se de que seu celular e computador estão na mesma rede Wi-Fi

### Build de Produção

Para builds de produção, use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
# Instale o EAS CLI
npm install -g eas-cli

# Faça login no Expo
eas login

# Build para iOS
eas build --platform ios

# Build para Android
eas build --platform android
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Rotas (roteamento baseado em arquivos do Expo Router)
│   ├── (dashboard)/       # Telas principais do app
│   │   └── (event)/       # Telas específicas do evento
│   │       ├── calendar/  # Visualização de calendário/agenda
│   │       ├── bookmarked.tsx
│   │       ├── feed.tsx
│   │       ├── info.tsx
│   │       └── speakers.tsx
│   ├── (modal)/           # Telas modais
│   │   ├── session/[id].tsx
│   │   └── speaker/[id].tsx
│   ├── auth.tsx           # Callback de autenticação
│   └── index.tsx          # Seletor de eventos
├── components/            # Componentes UI reutilizáveis
│   ├── feed/             # Componentes relacionados ao feed
│   ├── layout/           # Componentes de layout
│   └── ui/               # Primitivas UI
├── features/             # Módulos específicos de funcionalidades
│   └── sessions/         # Código relacionado a sessões
├── hooks/                # Hooks React customizados
├── lib/                  # Utilitários e tema
│   ├── supabase.ts       # Cliente Supabase
│   └── theme/           # Tokens de design
├── services/             # Camadas de API e serviços
├── store/                # Stores de estado Zustand
├── types/                # Definições de tipos TypeScript
└── utils/                # Funções auxiliares
```

---

## 📜 Scripts Disponíveis

| Comando             | Descrição                                 |
| ------------------- | ----------------------------------------- |
| `bun run start`     | Inicia o servidor de desenvolvimento Expo |
| `bun run ios`       | Executa no simulador iOS (apenas macOS)   |
| `bun run android`   | Executa no emulador Android               |
| `bun run web`       | Executa no navegador web                  |
| `bun run lint`      | Executa ESLint e corrige problemas        |
| `bun run format`    | Formata código com Prettier               |
| `bun run typecheck` | Verifica tipos TypeScript                 |

---

### Obter Ajuda

- Consulte a [Documentação do Expo](https://docs.expo.dev/)
- Consulte a [Documentação do Supabase](https://supabase.com/docs)
- Abra uma issue no [GitHub](https://github.com/pupunha-code/pupunha-conf/issues)

---

Feito com ❤️ para a comunidade Pupunha Code
