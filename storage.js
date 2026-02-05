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
  // Adiciona timestamp de atualização
  dados.ultimaAtualizacao = new Date().toISOString();
  
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
// AUTO-SAVE GLOBAL (NOVO - ESSENCIAL!)
// ==========================================

// Variáveis para controle do auto-save
let ultimosDadosSalvos = null;
let autoSaveAtivo = false;

// Função para ativar o auto-save (chamar no início da aplicação)
function ativarAutoSave(funcaoObterDados, intervaloMs = 3000) {
  if (autoSaveAtivo) {
    console.log("⏱️ Auto-save já está ativo");
    return;
  }
  
  // Guarda referência global para acessar de qualquer lugar
  window.obterDadosSistema = funcaoObterDados;
  autoSaveAtivo = true;
  
  console.log("⏱️ Auto-save ativado! (a cada " + intervaloMs + "ms)");
  
  // Auto-save periódico
  const intervalo = setInterval(() => {
    if (typeof window.obterDadosSistema === 'function') {
      const dadosAtuais = window.obterDadosSistema();
      
      if (dadosAtuais) {
        // Só salva se os dados mudaram
        const dadosString = JSON.stringify(dadosAtuais);
        if (dadosString !== ultimosDadosSalvos) {
          salvarDados(dadosAtuais);
          ultimosDadosSalvos = dadosString;
        }
      }
    }
  }, intervaloMs);
  
  // Salvar ao sair da página (beforeunload)
  window.addEventListener('beforeunload', () => {
    if (typeof window.obterDadosSistema === 'function') {
      const dadosAtuais = window.obterDadosSistema();
      if (dadosAtuais) {
        salvarDados(dadosAtuais);
      }
    }
  });
  
  // Salvar quando a aba perde foco (visibilitychange)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && typeof window.obterDadosSistema === 'function') {
      const dadosAtuais = window.obterDadosSistema();
      if (dadosAtuais) {
        salvarDados(dadosAtuais);
        ultimosDadosSalvos = JSON.stringify(dadosAtuais);
      }
    }
  });
  
  // Retorna função para desativar se necessário
  return () => {
    clearInterval(intervalo);
    autoSaveAtivo = false;
    console.log("⏹️ Auto-save desativado");
  };
}

// Função para forçar salvamento imediato
function salvarAgora() {
  if (typeof window.obterDadosSistema === 'function') {
    const dadosAtuais = window.obterDadosSistema();
    if (dadosAtuais) {
      salvarDados(dadosAtuais);
      ultimosDadosSalvos = JSON.stringify(dadosAtuais);
      console.log("💾 Salvamento forçado!");
      return true;
    }
  }
  console.warn("⚠️ Não foi possível salvar - função obterDadosSistema não definida");
  return false;
}

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

// ==========================================
// ESTOQUE
// ==========================================

function salvarProdutoEstoque(produto) {
  const dados = carregarDados();
  if (!dados.estoque) dados.estoque = [];
  
  const produtoExistente = dados.estoque.find(p => p.id === produto.id);
  
  if (produtoExistente) {
    // Atualiza produto existente
    Object.assign(produtoExistente, produto);
    produtoExistente.dataAtualizacao = new Date().toISOString();
    console.log("📦 Produto atualizado:", produto.nome);
  } else {
    // Novo produto
    const novoProduto = {
      id: produto.id || Date.now(),
      nome: produto.nome,
      quantidade: produto.quantidade,
      preco: produto.preco,
      tipo: produto.tipo, // 'gas' ou 'agua'
      dataCadastro: new Date().toISOString()
    };
    dados.estoque.push(novoProduto);
    console.log("📦 Novo produto adicionado:", novoProduto.nome);
  }
  
  salvarDados(dados);
  return produto;
}

// ==========================================
// EXPORTAR FUNÇÕES GLOBAIS
// ==========================================

window.salvarDados = salvarDados;
window.carregarDados = carregarDados;
window.ativarAutoSave = ativarAutoSave;
window.salvarAgora = salvarAgora;
window.salvarUsuario = salvarUsuario;
window.login = login;
window.logout = logout;
window.salvarVenda = salvarVenda;
window.salvarCliente = salvarCliente;
window.salvarProdutoEstoque = salvarProdutoEstoque;

console.log("💾 Storage carregado - Local + Firebase + Auto-Save ativos");
