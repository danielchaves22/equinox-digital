// root/README.md
# Zenit Monorepo

## Arquitetura de Banco de Dados

Este projeto usa `node-pg-migrate` para migrations e Prisma Client para queries.

### Estrutura de Schemas

- `core`: Autenticação, usuários e empresas
- `zenit`: Sistema financeiro

### Workflow de Desenvolvimento

1. **Criar uma nova migration**:
   ```bash
   pnpm migrate:create:core add_new_feature
   pnpm migrate:create:zenit add_new_feature