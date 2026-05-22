# Valeur Consultoria — Funil de Aplicação

Funil de qualificação em HTML puro. Zero dependências externas (exceto Google Fonts opcionais). Roda em qualquer servidor estático.

---

## Rodar localmente

```bash
# Opção 1 — Node.js (recomendado)
npx serve .

# Opção 2 — Python
python3 -m http.server 8000

# Opção 3 — abrir index.html direto no navegador
# (funciona para visualização, mas o submit vai falhar sem servidor)
```

Acesse: `http://localhost:3000` (ou a porta que aparecer no terminal)

---

## Estrutura de arquivos

```
valeur-funil/
├── index.html   ← Página principal (CSS crítico inline + estrutura HTML)
├── styles.css   ← Estilos completos (carregado de forma não-bloqueante)
├── app.js       ← Motor do funil: renderização, validação, tracking, submit
├── flow.js      ← Configuração: steps, copy, textos, regras de negócio
├── README.md    ← Este arquivo
└── DEPLOY.md    ← Passo a passo para publicar
```

---

## Configurações obrigatórias antes de publicar

Abra `flow.js` e localize o bloco `FUNNEL_CONFIG` no topo:

```js
export const FUNNEL_CONFIG = {
  webhookUrl:        'https://SEU_WEBHOOK_AQUI.com/lead',   // ← obrigatório
  calendlyUrl:       'https://calendly.com/valeur-consultoria', // ← seu Calendly
  responseTimeHours: 4,                                     // ← tempo de resposta prometido
  whatsappFallback:  '5541999999999',                       // ← seu WhatsApp com DDI
  companyName:       'Valeur Consultoria',
};
```

### Como criar o webhook para o Kommo CRM

1. Acesse seu painel do Kommo
2. Vá em **Integrações → Webhooks** (ou use o Zapier/Make como intermediário)
3. Crie um webhook que recebe POST com JSON
4. Cole a URL no campo `webhookUrl` acima

Campos enviados no payload:
```json
{
  "situacao_atual": "...",
  "tamanho_time": "...",
  "segmento": "...",
  "faturamento": "...",
  "ja_tentou": ["...", "..."],
  "maior_dor_hoje": "...",
  "urgencia": "...",
  "decisao": "...",
  "nome": "...",
  "empresa": "...",
  "whatsapp": "...",
  "email": "...",
  "_meta": {
    "source": "https://...",
    "referrer": "...",
    "submitted_at": "2025-01-01T00:00:00.000Z",
    "total_time_ms": 120000,
    "funnel": "valeur-aplicacao-v1"
  }
}
```

---

## Como adicionar o tracking

Abra `app.js` e localize `TRACKING_CONFIG` no topo:

```js
const TRACKING_CONFIG = {
  ga4_id: 'G-XXXXXXXXXX',       // ← seu ID do GA4
  meta_pixel_id: '1234567890',  // ← seu Meta Pixel
  custom_webhook: '',            // ← webhook adicional (Zapier, etc.)
};
```

Para ativar o GA4, descomente também o bloco de script no `<head>` do `index.html`.

Para ativar o Meta Pixel, descomente o bloco do Pixel no `<head>` do `index.html`.

---

## Como adicionar o logo real

1. Exporte o símbolo da Valeur como SVG (fundo transparente)
2. Substitua o bloco `<svg class="logo-mark">` no `index.html` pelo SVG real
3. Verifique se o SVG usa `fill="#C9A96E"` (champanhe/ouro) para manter consistência

---

## Como personalizar cores

Todas as cores estão como variáveis CSS no topo do `styles.css`:

```css
:root {
  --color-bg:      #111210;   /* fundo escuro */
  --color-primary: #1B4D3E;   /* verde escuro */
  --color-gold:    #C9A96E;   /* champanhe/ouro */
  --color-text:    #F0EBE0;   /* texto principal */
  /* ... */
}
```

---

## Como alterar textos e copy

Todo o copy está centralizado em `flow.js`:

- `heroContent` → headline, subheadline, CTA, stats
- `authorityContent` → seção de metodologia
- `faqContent` → perguntas e respostas do FAQ
- `disqualifyScreen` → tela de saída elegante
- `successScreen` → tela de confirmação com próximos passos
- `steps[]` → perguntas do formulário, labels, opções

---

## Como alterar as perguntas do formulário

Cada step em `steps[]` tem um array `fields[]`. Para adicionar, remover ou reordenar perguntas, edite diretamente esse array.

Tipos de campo disponíveis:
- `radio-cards` → seleção única com cards visuais
- `checkbox-cards` → seleção múltipla com cards
- `select` → dropdown
- `text` / `email` / `tel` → inputs de texto
- `checkbox` → caixa de aceite (privacidade, termos)

---

## Como alterar a lógica de qualificação

A desqualificação acontece no `nextStep` de cada step. É uma função que recebe `answers` (objeto com todas as respostas até aquele ponto) e retorna o ID do próximo step ou `'disqualify'`.

Exemplo:
```js
nextStep: (answers) => {
  if (answers['faturamento'] === 'menos_75k') return 'disqualify';
  return 'step-4';
},
```

Para alterar o critério de faturamento mínimo, mude o valor comparado.

---

## Como testar o funil sem enviar para o CRM

Enquanto `webhookUrl` estiver como `'https://SEU_WEBHOOK_AQUI.com/lead'`, o submit vai falhar de forma controlada — mostrará a mensagem de erro com opção de WhatsApp. Os dados ficam salvos em `localStorage` com a chave `valeur_lead_backup`.

Para testar o fluxo completo sem CRM, use https://webhook.site — crie um endpoint temporário e cole a URL no `webhookUrl`.

---

## Dados salvos localmente

- `sessionStorage['valeur_funnel']` → estado atual do formulário (persiste até fechar a aba)
- `localStorage['valeur_lead_backup']` → backup do payload em caso de falha no submit

Para limpar: `sessionStorage.clear()` e `localStorage.removeItem('valeur_lead_backup')` no console do navegador.
