# NLW Agent API 🚀

API em Node.js para gerenciamento de agentes, utilizando Fastify, Drizzle ORM e PostgreSQL.

---

## Como executar esse projeto

```bash
# Clone o repositório para a máquina local
git clone https://github.com/fagnerlopes/nlwagents-server.git

# Acesse a pasta do projeto
cd nlwagents-server

# Crie o arquivo .env
cp .env.example .env

# Rode o banco de dados
docker compose up -d

# Rodar as migrations
npx drizzle-kit migrate

# Rode o servidor em dev
npm run dev
```

Agora é só acessar o endpoint [health](localhost:3333)!! 🚀🚀🚀

---

## 📦 Dependências principais

| Pacote                      | Descrição                                                                                                                                                     | Link                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `@fastify/cors`             | Middleware para habilitar o CORS (Cross-Origin Resource Sharing) em aplicações Fastify, permitindo que sua API seja acessada de diferentes domínios.          | [🔗](https://github.com/fastify/fastify-cors)              |
| `drizzle-orm`               | ORM (Object-Relational Mapping) leve e moderno para TypeScript/JavaScript, facilitando a manipulação de bancos de dados relacionais de forma tipada e segura. | [🔗](https://orm.drizzle.team/)                            |
| `fastify`                   | Framework web rápido e eficiente para Node.js, focado em alta performance e baixo consumo de recursos.                                                        | [🔗](https://www.fastify.io/)                              |
| `fastify-type-provider-zod` | Integração entre Fastify e Zod, permitindo validação e tipagem automática de dados nas rotas usando o schema do Zod.                                          | [🔗](https://github.com/fastify/fastify-type-provider-zod) |
| `postgres`                  | Driver para conectar e interagir com bancos de dados PostgreSQL em Node.js.                                                                                   | [🔗](https://github.com/porsager/postgres)                 |
| `zod`                       | Biblioteca de validação e definição de schemas para TypeScript/JavaScript, usada para garantir que dados estejam no formato esperado.                         | [🔗](https://zod.dev/)                                     |
| `drizzle-kit`               | CLI para gerenciamento de migrações e geração de schemas SQL com Drizzle ORM.                                                                                 | [🔗](https://orm.drizzle.team/docs/overview)               |

---

## 🛠️ Comandos úteis do Drizzle Kit

```bash
# Gerar uma nova migration
npx drizzle-kit generate

# Rodar as migrations
npx drizzle-kit migrate

# Visualizar status das migrations
npx drizzle-kit status

# Visualizar o banco de dados na [interface](https://local.drizzle.studio/)
npx drizzle-kit studio
```

---

## 📝 Como adicionar novas migrations

1. Faça alterações nos arquivos de schema do banco de dados (`src/db/schema`).
2. Gere uma nova migration com o comando:
   ```bash
   npx drizzle-kit generate
   ```
   Isso criará um novo arquivo de migration na pasta configurada (ex: `src/db/migrations`).
3. Para aplicar as migrations ao banco de dados, execute:
   ```bash
   npx drizzle-kit migrate
   ```
4. Pronto! Sua migration foi criada e aplicada ao banco de dados.

> ℹ️ Consulte a [documentação oficial do Drizzle Kit](https://orm.drizzle.team/docs/overview) para mais detalhes e opções avançadas.
