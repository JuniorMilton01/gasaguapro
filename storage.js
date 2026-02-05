// ================================
// CONFIGURAÇÃO FIREBASE
// ================================
const APP_KEY = "gasaguapro";
let dbRef = null;

// Aguarda Firebase carregar
setTimeout(() => {
  if (typeof firebase !== 'undefined') {
    dbRef = firebase.database().ref('dados');
    console.log("☁️ Firebase pronto para sincronização");
    
    // Sincroniza dados existentes ao carregar
    sincronizarNaNuvem();
  }
}, 2000);

// ================================
// FUNÇÕES LOCAIS (LocalStorage)
// ================================

function salvarDados(dados) {
  // 1. Salva localmente
  localStorage.setItem(APP_KEY, JSON.stringify(dados));
  console.log("💾 Dados salvos localmente");
  
  // 2. Envia para Firebase
  enviarParaFirebase(dados);
  
  return dados;
}

function carregarDados() {
  const dados = localStorage.getItem(APP_KEY);
  const parsed = dados ? JSON.parse(dados) : criarDadosIniciais();
  
  // Tenta carregar do Firebase também (para atualizar)
  carregarDoFirebase();
  
  return parsed;
}

function criarDadosIniciais() {
  return {
    logado: false,
    usuario: null,
    vendas: [],
    clientes: [],
    estoque: [],
    ultimoAcesso: null
  };
}

// ================================
// FUNÇÕES FIREBASE
// ================================

function enviarParaFirebase(dados) {
  if (!dbRef) {
    console.log("⏳ Firebase não pronto, tentando novamente...");
    setTimeout(() => enviarParaFirebase(dados), 1000);
    return;
  }
  
  if (!navigator.onLine) {
    console.log("📵 Offline - Dados serão sincronizados depois");
    return;
  }
  
  dbRef.set(dados)
    .then(() => console.log("✅ Dados enviados para Firebase!"))
    .catch(erro => console.log("❌ Erro ao enviar:", erro));
}

function carregarDoFirebase() {
  if (!dbRef || !navigator.onLine) return;
  
  dbRef.once('value')
    .then(snapshot => {
      const dadosNuvem = snapshot.val();
      if (dadosNuvem) {
        console.log("☁️ Dados da nuvem recebidos");
        // Atualiza LocalStorage com dados da nuvem (se forem mais recentes)
        const dadosLocais = JSON.parse(localStorage.getItem(APP_KEY) || '{}');
        
        // Se tem mais vendas na nuvem, atualiza local
        if (dadosNuvem.vendas && dadosNuvem.vendas.length > (dadosLocais.vendas || []).length) {
          localStorage.setItem(APP_KEY, JSON.stringify(dadosNuvem));
          console.log("🔄 Dados atualizados da nuvem");
          // Recarrega a página para mostrar dados novos
          // location.reload(); // Descomente se quiser recarregar automaticamente
        }
      }
    })
    .catch(erro => console.log("❌ Erro ao carregar da nuvem:", erro));
}

function sincronizarNaNuvem() {
  const dados = carregarDados();
  enviarParaFirebase(dados);
}

// ================================
// CONTROLE DE SESSÃO
// ================================

function login(usuario) {
  const dados = carregarDados();
  dados.logado = true;
  dados.usuario = usuario || "Junior";
  dados.ultimoAcesso = new Date().toISOString();
  
  if (!dados.vendas) dados.vendas = [];
  if (!dados.clientes) dados.clientes = [];
  
  salvarDados(dados);
  console.log("Usuário logado:", dados.usuario);
}

function logout() {
  const dados = criarDadosIniciais();
  salvarDados(dados);
  
  if (dbRef) dbRef.remove();
  console.log("Usuário deslogado");
}

// ================================
// VENDAS
// ================================

function salvarVenda(dadosVenda) {
  const dados = carregarDados();
  
  if (!dados.logado) {
    alert("Faça login primeiro!");
    return false;
  }
  
  const venda = {
    id: Date.now(),
    ...dadosVenda,
    data: new Date().toLocaleString(),
    dataISO: new Date().toISOString()
  };
  
  if (!dados.vendas) dados.vendas = [];
  dados.vendas.push(venda);
  
  salvarDados(dados);
  console.log("Venda salva:", venda);
  return true;
}

// ================================
// CLIENTES
// ================================

function salvarCliente(cliente) {
  const dados = carregarDados();
  
  if (!dados.clientes) dados.clientes = [];
  
  const novoCliente = {
    id: Date.now(),
    ...cliente,
    dataCadastro: new Date().toISOString()
  };
  
  dados.clientes.push(novoCliente);
  salvarDados(dados);
  console.log("Cliente salvo:", novoCliente);
  return novoCliente;
}

// ================================
// SINCRONIZAÇÃO AUTOMÁTICA
// ================================

// Quando voltar online
window.addEventListener('online', () => {
  console.log('🔄 Online! Sincronizando dados pendentes...');
  sincronizarNaNuvem();
});

// Sincroniza a cada 30 segundos se houver mudanças
let ultimosDados = '';
setInterval(() => {
  if (!dbRef || !navigator.onLine) return;
  
  const dadosAtuais = localStorage.getItem(APP_KEY);
  if (dadosAtuais && dadosAtuais !== ultimosDados) {
    ultimosDados = dadosAtuais;
    dbRef.set(JSON.parse(dadosAtuais))
      .then(() => console.log("🔄 Auto-sincronização completa"))
      .catch(erro => console.log("❌ Erro auto-sync:", erro));
  }
}, 30000);

console.log('💾 Storage.js carregado - LocalStorage + Firebase ativos');
console.log('📡 Auto-sincronização a cada 30 segundos');
