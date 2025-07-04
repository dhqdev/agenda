# Sistema de Agenda Pessoal BACK+FRONT

Por enquanto ele esta Hospedado no Render, mas como eu não pago a versão PRO deles, é necessário esperar alguns segundos para que o sistema incialize:
https://agenda-6f9x.onrender.com


![image](https://github.com/user-attachments/assets/9dcdbac9-0fa7-4cf3-94b2-b98dc0755810)


Sistema completo de agenda com autenticação, desenvolvido com Node.js no backend e Vue.js no frontend.

## Funcionalidades

- 🔐 Login e registro de usuários
- 📅 Calendário interativo
- ➕ Criar, editar e excluir eventos
- 🎨 Interface moderna e responsiva
- 💾 Banco de dados SQLite

## Como rodar o projeto

### Backend
```bash
npm install
npm start
```

### Frontend (desenvolvimento)
```bash
cd client
npm install
npm run serve
```

### Produção
```bash
npm install
npm run build
npm start
```

O servidor roda na porta 3000 por padrão.

## Estrutura do projeto

```
├── server.js           # Servidor Node.js
├── package.json        # Dependências do backend
├── agenda.db          # Banco SQLite (criado automaticamente)
└── client/            # Frontend Vue.js
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## API Endpoints

- `POST /api/register` - Criar conta
- `POST /api/login` - Fazer login
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `PUT /api/events/:id` - Atualizar evento
- `DELETE /api/events/:id` - Excluir evento

## Tecnologias

- **Backend:** Node.js, Express, SQLite, JWT, bcrypt
- **Frontend:** Vue.js 3, Axios, Font Awesome
- **Database:** SQLite
