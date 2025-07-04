# Deploy da Agenda Pessoal

## Opções de Hospedagem

### 1. Render (Recomendado) ⭐
**Grátis e confiável**

1. Acesse [render.com](https://render.com)
2. Conecte com GitHub
3. Crie um novo "Web Service"
4. Conecte este repositório
5. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

### 2. Railway
**Deploy rápido**

1. Acesse [railway.app](https://railway.app)
2. Conecte com GitHub
3. Deploy from GitHub repo
4. Selecione este repositório

### 3. Vercel (Frontend) + Railway (Backend)
**Separado para performance**

**Frontend (Vercel):**
```bash
# Na pasta client/
npm install -g vercel
vercel
```

**Backend (Railway):**
- Use só o server.js + package.json

### 4. Glitch
**Mais simples de todas**

1. Acesse [glitch.com](https://glitch.com)
2. "New Project" → "Import from GitHub"
3. Cole a URL do seu repositório

## Comandos para Deploy

### Preparar para produção:
```bash
npm run build
```

### Testar localmente:
```bash
npm start
```

## URLs após deploy:
- Render: `https://seu-app.onrender.com`
- Railway: `https://seu-app.up.railway.app`
- Glitch: `https://seu-app.glitch.me`

## Configurações importantes:
- Porta: Usar `process.env.PORT || 3000`
- Banco: SQLite funciona em todos
- SSL: Automático nas plataformas
