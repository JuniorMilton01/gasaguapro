// ==========================================
// STORAGE - LocalStorage + Firebase + Auto-Save
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
  }
  
  return dados;
}

// ==========================================
// FUNÇÃO PRINCIPAL: Carregar
// ==========================================

function carregarDados() {
  const local = carregarLocal();
  
  if (local) {
    console.log("💾 Dados carregados do local");
    
    setTimeout(() => {
      verificarNuvem();
    }, 1000);
    
    return local;
  }
  
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
    
    if (dadosNuvem.ultimaAtualizacao && local && local.ultimaAtualizacao) {
      const dataNuvem = new Date(dadosNuvem.ultimaAtualizacao);
      const dataLocal = new Date(local.ultimaAtualizacao);
      
      if (dataNuvem > dataLocal) {
        console.log("🔄 Nuvem mais recente! Atualizando local...");
        salvarLocal(dadosNuvem);
      }
    } else if (dadosNuvem && !local) {
      console.log("✅ Restaurando dados da nuvem!");
      salvarLocal(dadosNuvem);
      alert("Dados restaurados com sucesso!");
      location.reload();
    }
  });
}

// ==========================================
// RESTAURAÇÃO AUTOMÁTICA
// ==========================================

window.addEventListener('load', () => {
  setTimeout(() => {
    const local = carregarLocal();
    
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
      if (typeof window.salvarNaNuvem === 'function') {
        window.salvarNaNuvem(local);
      }
    }
  }, 2000);
});

// ==========================================
// AUTO-SAVE GLOBAL
// ==========================================

let ultimosDadosSalvos = null;
let autoSaveAtivo = false;
let configAutoSave = {
  intervalo: 3000,
  salvarAoSair: true,
  salvarAoMudarAba: true,
  salvarAoPerderFoco: true,
  salvarAoClicarSair: true,
  salvarAoEnviarForm: true,
  debug: true
};

function ativarAutoSave(funcaoObterDados, opcoes) {
  if (autoSaveAtivo) {
    console.log("⏱️ Auto-save já está ativo");
    return function() {};
  }
  
  opcoes = opcoes || {};
  Object.assign(configAutoSave, opcoes);
  
  window.obterDadosSistema = funcaoObterDados;
  autoSaveAtivo = true;
  
  console.log("⏱️ Auto-save ativado!", configAutoSave);
  
  // 1. AUTO-SAVE PERIÓDICO
  const intervalo = setInterval(() => {
    if (typeof window.obterDadosSistema === 'function') {
      const dadosAtuais = window.obterDadosSistema();
      
      if (dadosAtuais) {
        const dadosString = JSON.stringify(dadosAtuais);
        if (dadosString !== ultimosDadosSalvos) {
          salvarDados(dadosAtuais);
          ultimosDadosSalvos = dadosString;
          
          if (configAutoSave.debug) {
            console.log("💾 Auto-save executado:", new Date().toLocaleTimeString());
          }
        }
      }
    }
  }, configAutoSave.intervalo);
  
  // 2. SALVAR AO FECHAR PÁGINA
  const handleBeforeUnload = function(e) {
    if (!configAutoSave.salvarAoSair) return;
    
    if (typeof window.obterDadosSistema === 'function') {
      const dadosAtuais = window.obterDadosSistema();
      if (dadosAtuais) {
        salvarDados(dadosAtuais);
        ultimosDadosSalvos = JSON.stringify(dadosAtuais);
      }
    }
    
    if (ultimosDadosSalvos) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  if (configAutoSave.salvarAoSair) {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }
  
  // 3. SALVAR AO MUDAR DE ABA
  const handleVisibilityChange = function() {
    if (!configAutoSave.salvarAoMudarAba) return;
    
    if (document.hidden) {
      if (typeof window.obterDadosSistema === 'function') {
        const dadosAtuais = window.obterDadosSistema();
        if (dadosAtuais) {
          salvarDados(dadosAtuais);
          ultimosDadosSalvos = JSON.stringify(dadosAtuais);
          
          if (configAutoSave.debug) {
            console.log("👋 Salvando ao sair da aba...");
          }
        }
      }
    } else {
      if (configAutoSave.debug) {
        console.log("👀 Voltou para a aba");
      }
    }
  };
  
  if (configAutoSave.salvarAoMudarAba) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  
  // 4. SALVAR AO PERDER FOCO
  const handleBlur = function() {
    if (!configAutoSave.salvarAoPerderFoco) return;
    
    if (typeof window.obterDadosSistema === 'function') {
      const dadosAtuais = window.obterDadosSistema();
      if (dadosAtuais) {
        salvarDados(dadosAtuais);
        ultimosDadosSalvos = JSON.stringify(dadosAtuais);
        
        if (configAutoSave.debug) {
          console.log("👋 Salvando ao perder foco...");
        }
      }
    }
  };
  
  if (configAutoSave.salvarAoPerderFoco) {
    window.addEventListener('blur', handleBlur);
  }
  
  // 5. DETECTAR CLIQUES EM BOTÕES DE SAIR
  const handleClickSair = function(e) {
    if (!configAutoSave.salvarAoClicarSair) return;
    
    const target = e.target.closest('button, a');
    if (!target) return;
    
    const texto = target.textContent.toLowerCase();
    const acoesSaida = ['sair', 'fechar', 'logout', 'encerrar', 'voltar', 'cancelar'];
    
    if (acoesSaida.some(function(acao) { return texto.indexOf(acao) !== -1; })) {
      if (typeof window.obterDadosSistema === 'function') {
        const dadosAtuais = window.obterDadosSistema();
        if (dadosAtuais) {
          salvarDados(dadosAtuais);
          ultimosDadosSalvos = JSON.stringify(dadosAtuais);
          
          if (configAutoSave.debug) {
            console.log("🚪 Detectado clique em sair/fechar - salvando...");
          }
        }
      }
    }
  };
  
  if (configAutoSave.salvarAoClicarSair) {
    document.addEventListener('click', handleClickSair);
  }
  
  // 6. DETECTAR FORMULÁRIOS
  const handleSubmit = function() {
    if (!configAutoSave.salvarAoEnviarForm) return;
    
    if (typeof window.obterDadosSistema === 'function') {
      const dadosAtuais = window.obterDadosSistema();
      if (dadosAtuais) {
        salvarDados(dadosAtuais);
        ultimosDadosSalvos = JSON.stringify(dadosAtuais);
        
        if (configAutoSave.debug) {
          console.log("📤 Formulário enviado - salvando...");
        }
      }
    }
  };
  
  if (configAutoSave.salvarAoEnviarForm) {
    document.addEventListener('submit', handleSubmit);
  }
  
  // RETORNA FUNÇÃO PARA DESATIVAR
  return function() {
    clearInterval(intervalo);
    
    if (configAutoSave.salvarAoSair) {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
    if (configAutoSave.salvarAoMudarAba) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    if (configAutoSave.salvarAoPerderFoco) {
      window.removeEventListener('blur', handleBlur);
    }
    if (configAutoSave.salvarAoClicarSair) {
      document.removeEventListener('click', handleClickSair);
    }
    if (configAutoSave.salvarAoEnviarForm) {
      document.removeEventListener('submit', handleSubmit);
    }
    
    autoSaveAtivo = false;
    console.log("⏹️ Auto-save desativado");
  };
}

function configurarAutoSave(novasConfig) {
  Object.assign(configAutoSave, novasConfig);
  console.log("⚙️ Configurações do auto-save atualizadas:", configAutoSave);
}

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

function statusAutoSave() {
  return {
    ativo: autoSaveAtivo,
    ultimoSalvamento: ultimosDadosSalvos ? new Date().toISOString() : null,
    configuracoes: Object.assign({}, configAutoSave)
  };
}

// ==========================================
// SINCRONIZAÇÃO ONLINE/OFFLINE
// ==========================================

window.addEventListener('online', function() {
  console.log("🌐 Online! Sincronizando...");
  const dados = carregarLocal();
  if (dados && typeof window.salvarNaNuvem === 'function') {
    window.salvarNaNuvem(dados);
  }
});

window.addEventListener('storage', function(e) {
  if (e.key === APP_KEY) {
    console.log("🔄 Dados atualizados em outra aba");
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
  const usuario = dados.usuarios ? dados.usuarios.find(function(u) { 
    return u.nome === nome && u.senha === senha; 
  }) : null;
  
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
  
  const produtoExistente = dados.estoque.find(function(p) { 
    return p.id === produto.id; 
  });
  
  if (produtoExistente) {
    Object.assign(produtoExistente, produto);
    produtoExistente.dataAtualizacao = new Date().toISOString();
    console.log("📦 Produto atualizado:", produto.nome);
  } else {
    const novoProduto = {
      id: produto.id || Date.now(),
      nome: produto.nome,
      quantidade: produto.quantidade,
      preco: produto.preco,
      tipo: produto.tipo,
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
window.configurarAutoSave = configurarAutoSave;
window.salvarAgora = salvarAgora;
window.statusAutoSave = statusAutoSave;
window.salvarUsuario = salvarUsuario;
window.login = login;
window.logout = logout;
window.salvarVenda = salvarVenda;
window.salvarCliente = salvarCliente;
window.salvarProdutoEstoque = salvarProdutoEstoque;

console.log("💾 Storage carregado - Local + Firebase + Auto-Save ativos");
console.log("📚 API disponível: ativarAutoSave(), salvarAgora(), configurarAutoSave(), statusAutoSave()");
