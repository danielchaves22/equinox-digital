/**
 * Script para configurar o Prisma em um monorepo PNPM
 * Executar com: node scripts/setup-prisma.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const backendDir = path.join(__dirname, '..', 'core-backend');
const prismaDir = path.join(backendDir, 'prisma');

// Função para execução de comandos
function exec(command, cwd = backendDir) {
  console.log(`\n🔧 Executando: ${command}`);
  try {
    return execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Erro ao executar: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Função para verificar existência de arquivos/diretórios
function checkExists(filePath, type = 'arquivo') {
  if (!fs.existsSync(filePath)) {
    console.error(`\n❌ ERRO: ${type} não encontrado: ${filePath}`);
    process.exit(1);
  }
  return true;
}

// Banner
console.log('\n=============================================');
console.log('🔧 CONFIGURAÇÃO DO PRISMA EM MONOREPO PNPM 🔧');
console.log('=============================================\n');

// 1. Verificar ambiente
console.log('🔍 Verificando ambiente...');
checkExists(backendDir, 'diretório do backend');
checkExists(prismaDir, 'diretório prisma');
checkExists(path.join(prismaDir, 'schema.prisma'), 'schema.prisma');
console.log('✅ Ambiente verificado com sucesso');

// 2. Limpar caches potencialmente problemáticos
console.log('\n🧹 Limpando caches...');
try {
  // Remover pastas de cache que podem estar causando problemas
  const cacheFolders = [
    path.join(backendDir, 'node_modules', '.prisma'),
    path.join(backendDir, 'node_modules', '.pnpm', '@prisma+client*'),
    path.join(backendDir, 'node_modules', '.pnpm', 'prisma*')
  ];
  
  for (const folder of cacheFolders) {
    if (fs.existsSync(folder)) {
      console.log(`Removendo: ${folder}`);
      execSync(`rm -rf "${folder}"`);
    }
  }
  console.log('✅ Caches limpos com sucesso');
} catch (error) {
  console.warn('\n⚠️ Aviso ao limpar caches:', error.message);
  console.log('Continuando com a configuração...');
}

// 3. Reinstalar dependências do Prisma
console.log('\n📦 Reinstalando dependências do Prisma...');
if (exec('pnpm install -D prisma', backendDir) && 
    exec('pnpm install @prisma/client', backendDir)) {
  console.log('✅ Dependências reinstaladas com sucesso');
} else {
  console.error('\n❌ Erro ao reinstalar dependências');
  process.exit(1);
}

// 4. Gerar cliente Prisma
console.log('\n🔄 Gerando cliente Prisma...');
if (exec('pnpm prisma generate', backendDir)) {
  console.log('✅ Cliente Prisma gerado com sucesso');
} else {
  console.error('\n❌ Erro ao gerar cliente Prisma');
  process.exit(1);
}

// 5. Verificar conexão com banco de dados
console.log('\n🔌 Verificando conexão com banco de dados...');
try {
  if (exec('pnpm prisma db pull --force', backendDir)) {
    console.log('✅ Conexão com banco de dados OK');
  } else {
    throw new Error('Falha ao conectar ao banco de dados');
  }
} catch (error) {
  console.error('\n❌ Erro ao conectar ao banco de dados:', error.message);
  console.log('\nVerifique se:');
  console.log('1. O arquivo .env existe com DATABASE_URL configurado corretamente');
  console.log('2. O banco de dados está em execução e acessível');
  console.log('3. As credenciais estão corretas');
  process.exit(1);
}

// 6. Perguntar sobre execução de migrações
const shouldMigrate = process.argv.includes('--migrate');
if (shouldMigrate) {
  console.log('\n🚀 Executando migrações...');
  if (exec('pnpm prisma migrate dev', backendDir)) {
    console.log('✅ Migrações aplicadas com sucesso');
  } else {
    console.error('\n❌ Erro ao aplicar migrações');
    process.exit(1);
  }
}

// Conclusão
console.log('\n\n✅✅✅ CONFIGURAÇÃO DO PRISMA CONCLUÍDA COM SUCESSO! ✅✅✅');
console.log('\nComandos úteis:');
console.log('- pnpm prisma:studio          # Interface visual do banco de dados');
console.log('- pnpm prisma:migrate         # Criar/aplicar migrações');
console.log('- pnpm prisma:generate        # Regenerar cliente Prisma');
console.log('\nSe ainda encontrar problemas:');
console.log('1. Tente remover node_modules recursivamente e reinstalar');
console.log('2. Verifique se a versão do Prisma é compatível em todos os pacotes');
console.log('3. Execute pnpm prisma generate novamente após alterações no schema\n');