// zenit-backend/scripts/test-auth.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CORE_URL = process.env.CORE_API_URL || 'http://localhost:3000/api';
const ZENIT_URL = `http://localhost:${process.env.PORT || 3010}/api`;

async function testAuth() {
  try {
    console.log('1. Fazendo login no core-backend...');
    const loginRes = await axios.post(`${CORE_URL}/auth/login`, {
      email: 'admin@equinox.com.br',
      password: '@dmin05c10'
    });
    
    const token = loginRes.data.token;
    console.log('Token obtido:', token.substring(0, 15) + '...');
    
    console.log('\n2. Testando endpoint /me do zenit-backend...');
    const meRes = await axios.get(`${ZENIT_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Resposta:', JSON.stringify(meRes.data, null, 2));
    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error);
  }
}

testAuth();