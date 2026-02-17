// limpeza-automatica.js
import { limparDadosExpirados } from './firebase-config.js';

// Lista de coleções do seu sistema
const colecoes = ['clientes', 'pedidos', 'produtos', 'vendas'];

// Função para limpar todos os dados expirados
async function executarLimpeza() {
  console.log('Iniciando limpeza de dados expirados...');
  
  for (const colecao of colecoes) {
    await limparDadosExpirados(colecao);
  }
  
  console.log('Limpeza concluída!');
}

// Executar imediatamente
executarLimpeza();

// Executar a cada 24 horas (86400000 ms)
setInterval(executarLimpeza, 86400000);