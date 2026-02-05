// ==========================================
// STORAGE - Local + Firebase
// ==========================================

const APP_KEY = "gasaguapro";
let sincronizando = false;

// ==========================================
// FUNÇÕES BÁSICAS
// ==========================================

function salvarLocal(dados) {
  localStorage.setItem(APP_KEY, JSON.stringify(dados));
  console.log("💾 Salvo localmente");
}

function carregarLocal() {
  const dados = localStorage.getItem(APP_KEY);
  return dados ? JSON.parse(dados) : null;
}

// ==========================================
// SALVAR (Local + Nuvem)
// ==========================================

function salvarDados(dados) {
  // 1. Salva local
  salvarLocal(dados);
  
  // 2. Tenta salvar na nuvem (se disponível)
  if (window.salvarNaNuvem && !sincronizando) {
    window.salvarNaNuvem(dados)
      .then(() => console.log("☁️ Sincronizado com nuvem"))
      .catch(() => console.log("📵 Offline - sincroniza depois"));
  }
  
  return dados;
}

function carregarDados() {
  // Primeiro tenta carregar do LocalStorage (mais rápido)
  const local = carregarLocal();
  
  // Se não tem local OU tem Firebase disponível, tenta carregar da nuvem
  if (!local && window.carregarDaNuvem) {
    console.log("Buscando dados na nuvem...");
    window.carregarDaNuvem((dadosNuvem) => {
      if (dadosNuvem) {
        // Restaura do Firebase para o LocalStorage
        salvarLocal(dadosNuvem);
        console.log("✅ Dados restaurados da nuvem!");
        // Recarrega a página para aplicar dados (opcional)
        // location.reload(); 
      }
    });
  }
  
  // Retorna o que tem no local (mesmo que vazio por enquanto)
  return local || { 
    logado: false, 
    usuarios: [], 
    vendas: [], 
    clientes: [],
    estoque: []
  };
}

// ==========================================
// RESTAURAÇÃO AUTOMÁTICA (IMPORTANTE!)
// ==========================================

// Ao carregar a página, verifica se precisa restaurar da nuvem
window.addEventListener('load', () => {
  setTimeout(() => {
    const local = carregarLocal();
    
    // Se não tem dados locais, tenta buscar na nuvem
    if (!local && window.carregarDaNuvem) {
      console.log("🔄 Verificando dados na nuvem...");
      
      window.carregarDaNuvem((dados) => {
        if (dados) {
          console.log("✅ Dados encontrados! Restaurando...");
          salvarLocal(dados);
          // Mostra mensagem ao usuário
          alert("Dados restaurados com sucesso!");
          // Recarrega para aplicar
          location.reload();
        } else {
          console.log("ℹ️ Nenhum dado salvo na nuvem ainda");
        }
      });
    }
  }, 2000); // Aguarda 2s para Firebase carregar
});

// ==========================================
// USUÁRIOS
// ==========================================

function salvarUsuario(usuario) {
  const dados = carregarDados();
  if (!dados.usuarios) dados.usuarios = [];
  
  const novoUsuario = {
    id: Date.now(),
    ...usuario,
    dataCadastro: new Date().toISOString()
  };
  
  dados.usuarios.push(novoUsuario);
  salvarDados(dados);
  console.log("Usuário salvo:", novoUsuario.nome);
  return novoUsuario;
}

function login(usuario, senha) {
  const dados = carregarDados();
  const usuarioEncontrado = dados.usuarios?.find(u => 
    u.nome === usuario && u.senha === senha
  );
  
  if (usuarioEncontrado) {
    dados.logado = true;
    dados.usuarioAtual = usuarioEncontrado;
    dados.ultimoAcesso = new Date().toISOString();
    salvarDados(dados);
    console.log("Login:", usuario);
    return true;
  }
  return false;
}

// ==========================================
// VENDAS
// ==========================================

function salvarVenda(venda) {
  const dados = carregarDados();
  if (!dados.vendas) dados.vendas = [];
  
  dados.vendas.push({
    id: Date.now(),
    ...venda,
    data: new Date().toISOString()
  });
  
  salvarDados(dados);
  console.log("Venda salva:", venda.produto);
}

// ==========================================
// CLIENTES
// ==========================================

function salvarCliente(cliente) {
  const dados = carregarDados();
  if (!dados.clientes) dados.clientes = [];
  
  dados.clientes.push({
    id: Date.now(),
    ...cliente,
    dataCadastro: new Date().toISOString()
  });
  
  salvarDados(dados);
  console.log("Cliente salvo:", cliente.nome);
}

console.log("💾 Storage pronto - Modo: Local + Firebase");
