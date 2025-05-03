## 8. Configuração e Execução

Siga estas etapas para configurar e executar o projeto Anki Clone em seu ambiente local.

### 8.1 Pré-requisitos

*   **Node.js e pnpm:** Certifique-se de ter o Node.js (versão 18 ou superior recomendada) e o gerenciador de pacotes `pnpm` instalados.
    *   Instalar pnpm: `npm install -g pnpm`
*   **Conta Supabase:** Crie uma conta gratuita no [Supabase](https://supabase.com/).

### 8.2 Configuração do Supabase

1.  **Criar Projeto:** No painel do Supabase, crie um novo projeto.
2.  **Obter Credenciais:** Navegue até "Project Settings" > "API". Copie a **URL do Projeto** e a **Chave Anônima Pública (`anon key`)**.
3.  **Aplicar Schema SQL:**
    *   Vá para "SQL Editor" no painel do Supabase.
    *   Clique em "New query".
    *   **Importante:** Se for a primeira vez, cole todo o conteúdo do arquivo `schema_v2_nested.sql` (fornecido com o código-fonte) e clique em "RUN". Se você já tiver uma versão anterior do schema, aplique apenas os comandos `ALTER TABLE` e `DROP/CREATE POLICY` conforme detalhado na seção 3.1 deste documento ou nos comentários do script SQL para evitar erros.

### 8.3 Configuração do Projeto Local

1.  **Descompactar Código-Fonte:** Extraia o arquivo `anki-clone-app_source_code.zip` para um diretório de sua escolha.
2.  **Navegar até o Diretório:** Abra um terminal e navegue até a pasta raiz do projeto descompactado (`anki-clone-app`).
3.  **Instalar Dependências:** Execute o comando:
    ```bash
    pnpm install
    ```
4.  **Configurar Variáveis de Ambiente:**
    *   Crie um arquivo chamado `.env` na raiz do projeto (`anki-clone-app/.env`).
    *   Adicione as credenciais do Supabase obtidas na etapa 8.2:
        ```dotenv
        VITE_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
        VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA_SUPABASE
        ```
    *   Substitua `SUA_URL_DO_PROJETO_SUPABASE` e `SUA_CHAVE_ANON_PUBLICA_SUPABASE` pelos valores reais.

### 8.4 Executando o Aplicativo (Desenvolvimento)

1.  **Iniciar Servidor:** No terminal, dentro da pasta do projeto, execute:
    ```bash
    pnpm run dev
    ```
2.  **Acessar:** Abra seu navegador e acesse o endereço fornecido pelo Vite (geralmente `http://localhost:5173`).

### 8.5 Build para Produção (Opcional)

Para criar uma versão otimizada para produção:

1.  **Executar Build:**
    ```bash
    pnpm run build
    ```
2.  **Deploy:** O conteúdo da pasta `dist/` resultante pode ser hospedado em qualquer servidor web estático.

