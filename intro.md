# Documentação: Anki Clone Web App (v2)

## 1. Introdução

Este documento detalha a arquitetura, implementação e funcionalidades do Anki Clone, um aplicativo web de flashcards inspirado no Anki, com foco na lógica de repetição espaçada (SRS) para otimizar o aprendizado.

**Funcionalidades Principais (v2):**

*   **Autenticação de Usuários:** Login e registro seguros usando Supabase Auth.
*   **Gerenciamento de Baralhos:** Criação, visualização, atualização e exclusão de baralhos.
*   **Baralhos Aninhados (Sub-baralhos):** **NOVO:** Suporte para organizar baralhos em uma estrutura hierárquica (ex: Baralho Pai > Sub-baralho).
*   **Gerenciamento de Cartões:** Criação, visualização e exclusão de cartões (frente e verso) dentro dos baralhos.
*   **Revisão Espaçada (SRS):** Implementação do algoritmo SM-2 para agendar cartões para revisão em intervalos otimizados.
*   **Interface de Revisão:** Apresentação dos cartões devidos, permitindo ao usuário avaliar sua resposta ("Errei", "Difícil", "Bom", "Fácil") para reagendamento.
*   **Interface Moderna:** **NOVO:** Design atualizado usando `shadcn/ui`, Tailwind CSS, navegação por sidebar, notificações toast, diálogos aprimorados e indicadores de carregamento (skeletons).
*   **Navegação Hierárquica:** **NOVO:** Visualização em árvore na lista de baralhos e navegação por breadcrumbs na página de detalhes do baralho.

**Tecnologias Utilizadas:**

*   **Frontend:** React, TypeScript, Vite
*   **UI:** shadcn/ui, Tailwind CSS, Lucide Icons
*   **Backend & Banco de Dados:** Supabase (PostgreSQL, Auth, Realtime APIs)
*   **Roteamento:** React Router DOM
*   **Algoritmo SRS:** SM-2

Este documento serve como um guia completo para entender o funcionamento interno do aplicativo, desde a estrutura do banco de dados até os componentes da interface do usuário e a lógica de repetição espaçada.

