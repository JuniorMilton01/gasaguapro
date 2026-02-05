// ================================
// CONFIGURAÇÃO PADRÃO
// ================================
const APP_KEY = "gasaguapro";

// ================================
// FUNÇÕES BASE
// ================================
function salvarDados(dados) {
  localStorage.setItem(APP_KEY, JSON.stringify(dados));
}

function carregarDados() {
  const dados = localStorage.getItem(APP_KEY);
  return dados ? JSON.parse(dados) : null;
}

// ================================
// CONTROLE DE SESSÃO
// ================================
function login() {
  const dados = {
    logado: true,
    usuario: "Junior",
    vendas: [],
    ultimoAcesso: new Date().toISOString()
  };

  salvarDados(dados);
  console.log("Usuário logado:", dados.usuario);
}

function logout() {
  localStorage.removeItem(APP_KEY);
  console.log("Usuário deslogado");
}

// ================================
// EXEMPLO DE DADOS (VENDA)
// ================================
function salvarVenda() {
  let dados = carregarDados();

  if (!dados || !dados.logado) {
    alert("Usuário não logado");
    return;
  }

  const venda = {
    id: Date.now(),
    produto: "Gás 13kg",
    valor: 120,
    data: new Date().toLocaleString()
  };

  dados.vendas.push(venda);
  salvarDados(dados);

  console.log("Venda salva:", venda);
  alert("Venda salva com sucesso!");
}

console.log('💾 Storage.js carregado - Funções: salvarDados, carregarDados, login, logout, salvarVenda');
