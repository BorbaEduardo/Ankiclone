# Algoritmo de Repetição Espaçada SM-2 (Baseado no SuperMemo)

Este documento descreve o algoritmo SM-2, conforme encontrado em discussões no fórum do Anki e baseado no algoritmo original do SuperMemo.

## Pseudocódigo e Regras:

1.  **Inicialização:**
    *   Divida o conhecimento nos menores itens possíveis (flashcards).
    *   Associe a cada item um Fator de Facilidade (E-Factor ou EF) inicial de 2.5.

2.  **Cálculo do Intervalo de Repetição (I):**
    *   Primeira repetição: I(1) = 1 dia.
    *   Segunda repetição: I(2) = 6 dias.
    *   Para n > 2: I(n) = I(n-1) * EF.
    *   Se o intervalo calculado for uma fração, arredonde-o para o inteiro mais próximo.

3.  **Avaliação da Qualidade da Resposta (q):**
    *   Após cada repetição, avalie a qualidade da resposta em uma escala de 0 a 5:
        *   5: Resposta perfeita.
        *   4: Resposta correta após hesitação.
        *   3: Resposta correta recordada com dificuldade séria.
        *   2: Resposta incorreta; onde a correta parecia fácil de recordar.
        *   1: Resposta incorreta; a correta foi lembrada.
        *   0: Apagão completo.

4.  **Atualização do Fator de Facilidade (EF):**
    *   Após cada repetição, antes de calcular o novo intervalo, modifique o EF do item recém-repetido usando a fórmula:
        *   EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    *   Onde:
        *   EF' é o novo valor do E-Factor.
        *   EF é o valor antigo do E-Factor.
        *   q é a qualidade da resposta (0-5).
    *   Se o EF calculado for menor que 1.3, defina EF como 1.3.

5.  **Reset do Intervalo (Falha na Recordação):**
    *   Se a qualidade da resposta (q) for menor que 3:
        *   Reinicie as repetições para o item desde o início (use os intervalos I(1), I(2), etc.).
        *   Não altere o E-Factor atual do item.

6.  **Repetição na Mesma Sessão:**
    *   Após cada sessão de repetição de um determinado dia, repita novamente todos os itens que tiveram uma avaliação de qualidade inferior a 4.
    *   Continue as repetições até que todos esses itens obtenham uma pontuação de pelo menos 4.

## Observações (Variações do Anki):

*   O Anki pode usar uma versão ligeiramente modificada ou adaptada do SM-2.
*   O Anki geralmente oferece 4 botões de resposta (Ex: Errei, Difícil, Bom, Fácil) que mapeiam para os valores de 'q'.
*   Pesquisas adicionais podem revelar detalhes específicos da implementação do Anki.



## Detalhes Adicionais (Baseado na Implementação do RemNote/Anki SM-2):

### Fases do Algoritmo:

1.  **Fase de Aprendizado (Learning Phase):**
    *   Objetivo: Internalização rápida de novas ideias.
    *   Funcionamento: Cards passam por passos com intervalos fixos (ex: `1m, 10m, 1d`).
    *   Respostas:
        *   **Errei (Forgot):** Retorna ao primeiro passo.
        *   **Difícil (Partially recalled):** Mantém no mesmo passo, mostra novamente na metade do tempo para o próximo passo.
        *   **Bom (Recalled with effort):** Avança para o próximo passo. Se for o último, entra na Fase Exponencial.
        *   **Fácil (Easily recalled):** Entra imediatamente na Fase Exponencial com um intervalo inicial específico (ex: 4 dias).
    *   _Parâmetros Relevantes:_ Passos fixos iniciais, Intervalo Fácil ao sair da fase.

2.  **Fase Exponencial (Exponential Phase):**
    *   Objetivo: Revisão de longo prazo.
    *   Funcionamento: Intervalos aumentam exponencialmente (multiplicando o intervalo anterior por um Fator de Intervalo).
    *   **Fator de Intervalo:** Determinado pela **Facilidade (Ease/EF)** do card e pelo botão de resposta.
        *   Facilidade Inicial: Geralmente 2.5 ou 250%.
    *   Respostas e Atualização da Facilidade/Intervalo:
        *   **Errei (Forgot):**
            *   Fator de Intervalo: Usa um multiplicador de lapso (ex: 0.1, < 1).
            *   Facilidade: Diminui (ex: -20 pontos percentuais).
            *   Próximo Passo: Entra na Fase de Reaprendizado.
        *   **Difícil (Partially recalled):**
            *   Fator de Intervalo: Fixo (ex: 1.2).
            *   Facilidade: Diminui (ex: -15 pontos percentuais).
        *   **Bom (Recalled with effort):**
            *   Fator de Intervalo: Igual à Facilidade atual.
            *   Facilidade: Inalterada.
        *   **Fácil (Easily recalled):**
            *   Fator de Intervalo: Facilidade atual * Bônus Fácil (ex: 1.3).
            *   Facilidade: Aumenta (ex: +15 pontos percentuais).
    *   Ajustes Adicionais no Fator de Intervalo:
        *   Pode ser multiplicado por um multiplicador global.
        *   Adição de ruído aleatório para evitar que cards fiquem agrupados.
    *   Cálculo do Próximo Intervalo: Intervalo Atual * Fator de Intervalo.
    *   Bônus por Atraso: Se revisado com atraso (e não 'Errei'), um bônus é adicionado ao intervalo atual antes da multiplicação, dependendo dos dias de atraso e da dificuldade da resposta.
    *   Limite Mínimo de Facilidade: Geralmente 1.3 ou 130%.
    *   _Parâmetros Relevantes:_ Facilidade Inicial, Multiplicador de Lapso, Bônus Fácil, Multiplicador de Intervalo.

3.  **Fase de Reaprendizado (Relearning Phase):**
    *   Ativação: Quando um card na Fase Exponencial é marcado como 'Errei'.
    *   Funcionamento: Similar à Fase de Aprendizado, com passos fixos.
    *   Retorno à Fase Exponencial: Após completar os passos ou ao pressionar 'Fácil'.
    *   Cálculo do Intervalo ao Retornar: Intervalo anterior (antes de errar) * Multiplicador de Lapso.
    *   _Parâmetros Relevantes:_ Passos fixos de reaprendizado.

### Mapeamento de Botões (Exemplo Anki):

*   **Again/Errei:** Geralmente mapeia para q < 3 (SM-2) ou 'Forgot' (RemNote).
*   **Hard/Difícil:** Mapeia para q = 3 (SM-2) ou 'Partially Recalled' (RemNote).
*   **Good/Bom:** Mapeia para q = 4 (SM-2) ou 'Recalled with Effort' (RemNote).
*   **Easy/Fácil:** Mapeia para q = 5 (SM-2) ou 'Easily Recalled' (RemNote).

**Nota:** A implementação exata pode variar. O Anki moderno também introduziu o algoritmo FSRS como alternativa ao SM-2.
