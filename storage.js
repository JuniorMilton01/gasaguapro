// ==========================================
// STORAGE - LocalStorage + Firebase
// ==========================================

const APP_KEY = "gasaguapro";

// ==========================================
// FUNÇÕES LOCAIS (LocalStorage)
// ==========================================

function salvarLocal(dados) {
  try {
    localStorage.setItem(APP_KEY, JSON.stringify(dados));
    return true;
  } catch (e) {
    console.error("Erro ao salvar local:", e);
    return false;
  }
}

function carregarLocal() {
  try {
    const dados = localStorage.getItem(APP_KEY);
    return dados ? JSON.parse(dados) : null;
  } catch (e) {
    console.error("Erro ao carregar local:", e);
    return null;
  }
}

// ==========================================
// FUNÇÃO PRINCIPAL: Salvar (Local + Nuvem)
// ==========================================

function salvarDados(dados) {
  // 1. Salva localmente (sempre)
  salvarLocal(dados);
  console.log("💾 Dados salvos localmente");
  
  // 2. Tenta salvar na nuvem (se Firebase disponível)
  if (typeof window.salvarNaNuvem === 'function') {
    window.salvarNaNuvem(dados)
      .then((sucesso) => {
        if (sucesso) {
          console.log("☁️ Sincronizado com nuvem!");
        }
      })
      .catch(() => {
        console.log("📵 Offline - sincroniza depois");
      });
  } else {
    console.log("⏳ Firebase ainda não carregado");
  }
  
  return dados;
}

// ==========================================
// FUNÇÃO PRINCIPAL: Carregar (Local primeiro, Nuvem depois)
// ==========================================

function carregarDados() {
  // 1. Tenta carregar do LocalStorage (rápido)
  const local = carregarLocal();
  
  if (local) {
    console.log("💾 Dados carregados do local");
    
    // 2. Verifica se tem atualizações na nuvem (em background)
    setTimeout(() => {
      verificarNuvem();
    }, 1000);
    
    return local;
  }
  
  // 3. Se não tem local, retorna estrutura vazia
  // (a restauração da nuvem acontece no load da página)
  return {
    logado: false,
    usuarios: [],
    vendas: [],
    clientes: [],
    estoque: [],
    ultimoAcesso: null
  };
}

// ==========================================
// VERIFICAR E RESTAURAR DA NUVEM
// ==========================================

function verificarNuvem() {
  if (typeof window.carregarDaNuvem !== 'function') return;
  
  window.carregarDaNuvem((dadosNuvem) => {
    if (!dadosNuvem) return;
    
    const local = carregarLocal();
    
    // Se nuvem tem dados mais recentes, atualiza local
    if (dadosNuvem.ultimaAtualizacao && local && local.ultimaAtualizacao) {
      const dataNuvem = new Date(dadosNuvem.ultimaAtualizacao);
      const dataLocal = new Date(local.ultimaAtualizacao);
      
      if (dataNuvem > dataLocal) {
        console.log("🔄 Nuvem mais recente! Atualizando local...");
        salvarLocal(dadosNuvem);
      }
    } else if (dadosNuvem && !local) {
      // Se não tem local mas tem na nuvem, restaura
      console.log("✅ Restaurando dados da nuvem!");
      salvarLocal(dadosNuvem);
      alert("Dados restaurados com sucesso!");
      location.reload();
    }
  });
}

// ==========================================
// RESTAURAÇÃO AUTOMÁTICA AO CARREGAR PÁGINA
// ==========================================

window.addEventListener('load', () => {
  // Aguarda Firebase carregar
  setTimeout(() => {
    const local = carregarLocal();
    
    // Se não tem dados locais, tenta buscar na nuvem
    if (!local && typeof window.carregarDaNuvem === 'function') {
      console.log("🔍 Buscando dados na nuvem...");
      
      window.carregarDaNuvem((dados) => {
        if (dados) {
          console.log("✅ Dados encontrados! Restaurando...");
          salvarLocal(dados);
          alert("Dados restaurados do servidor!");
          location.reload();
        } else {
          console.log("ℹ️ Nenhum dado salvo ainda");
        }
      });
    } else if (local) {
      // Tem dados locais, sincroniza com nuvem em background
      if (typeof window.salvarNaNuvem === 'function') {
        window.salvarNaNuvem(local);
      }
    }
  }, 2000);
});

// ==========================================
// QUANDO VOLTAR ONLINE, SINCRONIZA
// ==========================================

window.addEventListener('online', () => {
  console.log("🌐 Online! Sincronizando...");
  const dados = carregarLocal();
  if (dados && typeof window.salvarNaNuvem === 'function') {
    window.salvarNaNuvem(dados);
  }
});

// ==========================================
// USUÁRIOS
// ==========================================

function salvarUsuario(usuario) {
  const dados = carregarDados();
  if (!dados.usuarios) dados.usuarios = [];
  
  const novoUsuario = {
    id: Date.now(),
    nome: usuario.nome,
    email: usuario.email,
    senha: usuario.senha,
    dataCadastro: new Date().toISOString()
  };
  
  dados.usuarios.push(novoUsuario);
  salvarDados(dados);
  console.log("👤 Usuário salvo:", novoUsuario.nome);
  return novoUsuario;
}

function login(nome, senha) {
  const dados = carregarDados();
  const usuario = dados.usuarios?.find(u => u.nome === nome && u.senha === senha);
  
  if (usuario) {
    dados.logado = true;
    dados.usuarioAtual = usuario;
    dados.ultimoAcesso = new Date().toISOString();
    salvarDados(dados);
    console.log("✅ Login:", nome);
    return true;
  }
  console.log("❌ Login falhou:", nome);
  return false;
}

function logout() {
  const dados = carregarDados();
  dados.logado = false;
  dados.usuarioAtual = null;
  salvarDados(dados);
  console.log("👋 Logout");
}

// ==========================================
// VENDAS
// ==========================================

function salvarVenda(venda) {
  const dados = carregarDados();
  if (!dados.vendas) dados.vendas = [];
  
  const novaVenda = {
    id: Date.now(),
    cliente: venda.cliente,
    produto: venda.produto,
    quantidade: venda.quantidade,
    valor: venda.valor,
    data: new Date().toISOString()
  };
  
  dados.vendas.push(novaVenda);
  salvarDados(dados);
  console.log("🛒 Venda salva:", novaVenda.produto);
  return novaVenda;
}

// ==========================================
// CLIENTES
// ==========================================

function salvarCliente(cliente) {
  const dados = carregarDados();
  if (!dados.clientes) dados.clientes = [];
  
  const novoCliente = {
    id: Date.now(),
    nome: cliente.nome,
    telefone: cliente.telefone,
    endereco: cliente.endereco,
    dataCadastro: new Date().toISOString()
  };
  
  dados.clientes.push(novoCliente);
  salvarDados(dados);
  console.log("👥 Cliente salvo:", novoCliente.nome);
  return novoCliente;
}

console.log("💾 Storage carregado - Local + Firebase ativos");
