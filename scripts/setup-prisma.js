// root/scripts/setup-prisma.js
/**
 * Script para configurar o Prisma em um monorepo PNPM com node-pg-migrate
 * Executar com: node scripts/setup-prisma.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const backends = [
  {
    name: 'core-backend',
    dir: path.join(__dirname, '..', 'core-backend'),
  },
  {
    name: 'zenit-backend',
    dir: path.join(__dirname, '..', 'zenit-backend'),
  }
];

// Função para execução de comandos
function exec(command, cwd) {
  console.log(`\n🔧 Executando: ${command}`);
  console.log(`📍 Diretório: ${cwd}`);
  try {
    return execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Erro ao executar: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Banner
console.log('\n=============================================');
console.log('🔧 CONFIGURAÇÃO DO PRISMA + NODE-PG-MIGRATE 🔧');
console.log('=============================================\n');

// Processar cada backend
backends.forEach(backend => {
  console.log(`\n📦 Configurando ${backend.name}...`);
  console.log('----------------------------------------');
  
  const backendDir = backend.dir;
  
  // 1. Limpar caches
  console.log('\n🧹 Limpando caches...');
  try {
    const cacheFolders = [
      path.join(backendDir, 'node_modules', '.prisma'),
      path.join(backendDir, 'src', 'generated'),
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
  }
  
  // 2. Gerar cliente Prisma
  console.log('\n🔄 Gerando cliente Prisma...');
  if (exec('prisma generate', backendDir)) {
    console.log('✅ Cliente Prisma gerado com sucesso');
  } else {
    console.error(`\n❌ Erro ao gerar cliente Prisma para ${backend.name}`);
  }
});

// Conclusão
console.log('\n\n✅✅✅ CONFIGURAÇÃO CONCLUÍDA! ✅✅✅');
console.log('\nWorkflow para migrations:');
console.log('1. Criar migration: pnpm migrate:create:core (ou zenit)');
console.log('2. Aplicar migrations: pnpm migrate:all');
console.log('3. Sincronizar com Prisma: pnpm db:pull:all');
console.log('4. Gerar client: pnpm prisma:generate:all');
console.log('\nOu use o comando tudo-em-um: pnpm db:setup\n');