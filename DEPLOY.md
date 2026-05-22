# DEPLOY.md — Como publicar o funil da Valeur

Escolha a opção abaixo. Todas são gratuitas ou de baixo custo e funcionam perfeitamente para esse tipo de página estática.

---

## Opção 1 — Netlify (recomendado — mais simples)

### Drag and drop (sem terminal)
1. Acesse https://app.netlify.com
2. Crie uma conta gratuita (ou faça login)
3. Na página inicial, arraste a pasta `valeur-funil/` inteira para a área indicada
4. Aguarde ~30 segundos — o site estará no ar com URL automática (ex: `amazing-valeur-123.netlify.app`)
5. Para usar domínio próprio: vá em **Domain settings → Add custom domain**

### Via CLI
```bash
npm install -g netlify-cli
cd valeur-funil
netlify deploy --prod --dir .
```

---

## Opção 2 — Vercel

### Via CLI
```bash
npm install -g vercel
cd valeur-funil
vercel --prod
```

### Via interface
1. Acesse https://vercel.com/new
2. Conecte seu GitHub e selecione o repositório, **ou** clique em "Browse" para fazer upload direto da pasta
3. Clique em "Deploy" — pronto

---

## Opção 3 — GitHub Pages

1. Crie um repositório no GitHub (pode ser privado)
2. Faça upload dos arquivos para a branch `main`
3. Vá em **Settings → Pages**
4. Em "Source", selecione **Deploy from a branch → main → / (root)**
5. Clique em "Save"
6. Aguarde ~1 minuto — o site ficará em `https://seuusuario.github.io/nome-do-repo`

Para domínio próprio: adicione um arquivo `CNAME` na raiz com seu domínio (ex: `funil.valeurconsultoria.com.br`) e configure o DNS.

---

## Opção 4 — Cloudflare Pages

1. Acesse https://dash.cloudflare.com → **Pages → Create a project**
2. Escolha "Upload assets" (sem precisar de GitHub)
3. Arraste a pasta `valeur-funil/`
4. Clique em "Deploy site"

**Vantagens:** CDN global, HTTPS automático, sem limite de banda, proteção DDoS incluída.

---

## Opção 5 — Amazon S3 + CloudFront

### Setup básico
```bash
# Instale o AWS CLI (https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
aws configure  # insira suas credenciais

# Crie o bucket (substitua NOME pelo nome desejado)
aws s3 mb s3://valeur-funil-NOME

# Habilite hospedagem estática
aws s3 website s3://valeur-funil-NOME --index-document index.html --error-document index.html

# Faça upload dos arquivos
aws s3 sync . s3://valeur-funil-NOME --acl public-read

# URL do site: http://valeur-funil-NOME.s3-website-REGIAO.amazonaws.com
```

Para HTTPS + domínio próprio: configure o CloudFront apontando para o bucket.

---

## Opção 6 — Firebase Hosting

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Autentique
firebase login

# Inicialize o projeto
cd valeur-funil
firebase init hosting
# Responda:
#   - Use an existing project (ou crie um novo)
#   - What do you want to use as your public directory? → . (ponto)
#   - Configure as a single-page app? → No

# Publique
firebase deploy
```

---

## Configurar domínio próprio (qualquer plataforma)

1. Acesse o painel DNS do seu domínio (Registro.br, GoDaddy, Cloudflare, etc.)
2. Adicione um registro CNAME apontando para o domínio fornecido pela plataforma:
   ```
   funil.valeurconsultoria.com.br  →  CNAME  →  amazing-valeur-123.netlify.app
   ```
3. Aguarde propagação do DNS (pode levar até 24h, geralmente menos de 1h)
4. Configure o domínio também no painel da plataforma de hospedagem

---

## Checklist pré-publicação

- [ ] `webhookUrl` configurado com a URL real do Kommo/Zapier
- [ ] `calendlyUrl` configurado com seu link real de agendamento
- [ ] `whatsappFallback` com o número correto (DDI + DDD + número)
- [ ] Logo SVG real substituído no `index.html`
- [ ] URL do Instagram/conteúdo gratuito atualizada em `disqualifyScreen`
- [ ] Pixel do Meta e GA4 configurados (se desejar tracking)
- [ ] Teste completo do formulário em mobile e desktop
- [ ] Teste do fluxo de desqualificação (faturamento abaixo de R$75k)
- [ ] Teste do submit (use https://webhook.site para validar o payload)

---

## Testar o submit antes de publicar

Use o https://webhook.site para criar um endpoint temporário gratuito:

1. Acesse https://webhook.site
2. Copie a URL única gerada (ex: `https://webhook.site/abc-123`)
3. Cole em `FUNNEL_CONFIG.webhookUrl` no `flow.js`
4. Preencha o formulário completo
5. No webhook.site, verifique se o payload chegou com todos os campos

Depois substitua pela URL real do Kommo e republique.
