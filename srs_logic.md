## 4. Lógica de Repetição Espaçada (SRS - `src/lib/srs.ts`)

O núcleo do aprendizado eficiente no aplicativo é o algoritmo de repetição espaçada. Foi implementada uma versão baseada no **SM-2**, um algoritmo popularizado pelo Anki original.

### 4.1 O Algoritmo SM-2 (Simplificado)

O objetivo é agendar a próxima revisão de um cartão com base na dificuldade percebida pelo usuário ao respondê-lo.

**Parâmetros por Cartão (armazenados na tabela `reviews`):**

*   `interval` (I): O número de dias até a próxima revisão.
*   `repetitions` (n): O número de vezes que o cartão foi recordado corretamente consecutivamente desde a última vez que foi classificado como incorreto.
*   `ease_factor` (EF): Um número (começando em 2.5) que representa a facilidade com que o cartão é lembrado. Valores menores indicam maior dificuldade.

**Processo de Atualização (função `updateReviewData`):**

1.  **Entrada:** O registro atual da tabela `reviews` para o cartão e a **qualidade da resposta (q)** fornecida pelo usuário (mapeada dos botões "Errei", "Difícil", "Bom", "Fácil"). Tipicamente, `q` varia de 0 a 5.
    *   Errei: `q = 0` ou `1`
    *   Difícil: `q = 2` ou `3`
    *   Bom: `q = 4`
    *   Fácil: `q = 5`
2.  **Se `q < 3` (Resposta Incorreta ou Difícil):**
    *   `repetitions` (n) é resetado para 0.
    *   `interval` (I) é resetado para 1 (revisar novamente em 1 dia).
3.  **Se `q >= 3` (Resposta Correta):**
    *   `repetitions` (n) é incrementado em 1.
    *   **Cálculo do Novo Intervalo (I):**
        *   Se `n = 1`: `I = 1`
        *   Se `n = 2`: `I = 6`
        *   Se `n > 2`: `I = I(n-1) * EF` (O intervalo anterior multiplicado pelo Fator de Facilidade). O resultado é arredondado.
    *   **Atualização do Fator de Facilidade (EF):**
        *   `EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))`
        *   Se `EF < 1.3`, então `EF = 1.3` (valor mínimo).
4.  **Cálculo da Próxima Data de Revisão (`due_date`):** A data atual é somada ao `interval` calculado (em dias).
5.  **Saída:** A função retorna os novos valores de `interval`, `repetitions`, `ease_factor` e `due_date` para serem atualizados no banco de dados.

### 4.2 Implementação (`src/lib/srs.ts`)

O arquivo `srs.ts` contém a função `updateReviewData` que implementa a lógica descrita acima.

```typescript
import { ReviewData } from "@/types";

// Função para calcular a próxima data de revisão baseada na data atual e no intervalo em dias
function calculateDueDate(intervalDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString();
}

export function updateReviewData(review: ReviewData, quality: number): Partial<ReviewData> {
  let newInterval: number;
  let newRepetitions: number;
  // Garante que EF seja tratado como número, com fallback para 2.5
  let newEaseFactor = Number(review.ease_factor) || 2.5;

  if (quality < 3) {
    // Resposta incorreta ou difícil
    newRepetitions = 0;
    newInterval = 1; // Revisar novamente em 1 dia
  } else {
    // Resposta correta
    newRepetitions = review.repetitions + 1;

    if (review.repetitions === 0) {
      newInterval = 1;
    } else if (review.repetitions === 1) {
      newInterval = 6;
    } else {
      // Certifique-se de que review.interval é um número
      const currentInterval = Number(review.interval) || 1; // Fallback para 1 se não for número
      newInterval = Math.round(currentInterval * newEaseFactor);
    }

    // Atualiza o Fator de Facilidade (EF)
    newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3; // EF mínimo
    }
  }

  const newDueDate = calculateDueDate(newInterval);

  return {
    due_date: newDueDate,
    interval: newInterval,
    ease_factor: newEaseFactor,
    repetitions: newRepetitions,
    // last_reviewed_at será definido no hook/componente que chama esta função
  };
}
```

*Nota*: A implementação atual segue o SM-2. Outros algoritmos como FSRS (usado por versões mais recentes do Anki) poderiam ser implementados futuramente para potentially melhores resultados, mas exigiriam uma lógica mais complexa e possivelmente mais dados armazenados.

