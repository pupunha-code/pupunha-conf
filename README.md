# 🎤 Pupunha Conf

App mobile para gerenciamento de conferências e meetups do Pupunha Code. Desenvolvido com React Native e Expo.

## ✨ Funcionalidades

- 📅 **Calendário de Eventos** - Navegue por sessões organizadas por dia
- 👥 **Palestrantes** - Perfis com avatares do GitHub, biografias e links sociais
- 📝 **Detalhes das Sessões** - Informações completas sobre palestras e workshops
- 🔖 **Favoritos** - Salve sessões favoritas para acesso rápido
- 🌓 **Modo Escuro** - Suporte automático a tema claro/escuro
- 📱 **Multiplataforma** - iOS, Android e Web

## 🛠️ Tecnologias

- Expo ~54.0
- React Native 0.81.5
- TypeScript
- Zustand (gerenciamento de estado)
- Expo Router (roteamento)

## 📋 Pré-requisitos

- [Bun](https://bun.sh) (v1.0 ou superior)
- Node.js (v18 ou superior)
- Expo CLI (opcional)

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd pupunha-conf
   ```

2. **Instale as dependências**
   ```bash
   bun install
   ```

## 💻 Desenvolvimento

1. **Inicie o servidor de desenvolvimento**
   ```bash
   bun run start
   ```

2. **Execute em uma plataforma específica**
   ```bash
   bun run ios      # iOS Simulator (macOS)
   bun run android  # Android Emulator
   bun run web      # Navegador web
   ```

## 📜 Scripts Disponíveis

- `bun run start` - Inicia o servidor Expo
- `bun run ios` - Executa no simulador iOS
- `bun run android` - Executa no emulador Android
- `bun run web` - Executa no navegador
- `bun run lint` - Executa o linter
- `bun run format` - Formata o código
- `bun run typecheck` - Verifica tipos TypeScript

## 📁 Estrutura do Projeto

```
src/
├── app/              # Rotas (Expo Router)
├── components/        # Componentes reutilizáveis
├── features/         # Funcionalidades específicas
├── hooks/           # Hooks customizados
├── lib/             # Utilitários e tema
├── store/           # Stores Zustand
├── types/           # Definições TypeScript
└── utils/           # Funções utilitárias
```

## 📄 Licença

Este projeto é privado e proprietário.

## 👤 Autor

**Luma Montes**

---

Feito com ❤️ para a comunidade Pupunha Code
