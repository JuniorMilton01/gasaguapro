// Storage Local + Integração Firebase
const APP_KEY = "gasaguapro";

function salvarDados(dados) {
  localStorage.setItem(APP_KEY, JSON.stringify(dados));
  console.log("💾 Local:", dados);
  
  // Dispara evento para sincronização
  window.dispatchEvent(new CustomEvent('dadosAtualizados', { detail: dados }));
  return dados;
}

function carregarDados() {
  const dados = localStorage.getItem(APP_KEY);
  return dados ? JSON.parse(dados) : { logado: false, vendas: [], clientes: [] };
}

function login(usuario) {
  const dados = carregarDados();
  dados.logado = true;
  dados.usuario = usuario || "Junior";
  dados.ultimoAcesso = new Date().toISOString();
  salvarDados(dados);
}

function logout() {
  localStorage.removeItem(APP_KEY);
  salvarDados({ logado: false, vendas: [], clientes: [] });
}

function salvarVenda(venda) {
  const dados = carregarDados();
  if (!dados.vendas) dados.vendas = [];
  dados.vendas.push({
    id: Date.now(),
    ...venda,
    data: new Date().toISOString()
  });
  salvarDados(dados);
  return true;
}

console.log("💾 Storage.js pronto");
