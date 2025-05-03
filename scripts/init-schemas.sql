-- scripts/init-schemas.sql
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS zenit;

-- Comentários para documentar a estrutura
COMMENT ON SCHEMA core IS 'Schema central para autenticação e autorização';
COMMENT ON SCHEMA zenit IS 'Schema específico para a aplicação de gestão financeira';

-- Definir permissões (opcional)
GRANT USAGE ON SCHEMA core TO postgres;
GRANT USAGE ON SCHEMA zenit TO postgres;