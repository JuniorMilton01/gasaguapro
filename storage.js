// ================================
// CONFIGURAÇÃO
// ================================
const APP_KEY = "gasaguapro";

// Referência ao Firebase
const dbRef = firebase ? firebase.database().ref('dados') : null;

// ================================
// FUNÇÕES BASE (LocalStorage + Firebase)
// ================================

// Salvar dados (Local + Nuvem)
function salvarDados(dados) {
  // 1. Salva no LocalStorage (offline)
  localStorage.setItem(APP_KEY, JSON.stringify(dados));
  console.log("💾 Dados salvos localmente");
  
  // 2. Salva no Firebase (online)
  if (dbRef && navigator.onLine) {
    dbRef.set(dados)
      .then(() => console.log("☁️ Dados salvos na nuvem (Firebase)"))
      .catch(erro => console.log("❌ Erro ao salvar na nuvem:", erro));
  } else if (!navigator.onLine) {
    console.log("📵 Offline - Dados serão sincronizados quando voltar a internet");
  }
}

// Carregar dados (Firebase tem prioridade)
function carregarDados(callback) {
  // Tenta carregar do Firebase primeiro (dados mais recentes)
  if (dbRef && navigator.onLine) {
    dbRef.once('value')
      .then(snapshot => {
        const dadosFirebase = snapshot.val();
        if (dadosFirebase) {
          console.log("☁️ Dados carregados da nuvem");
          // Atualiza LocalStorage com dados da nuvem
          localStorage.setItem(APP_KEY, JSON.stringify(dadosFirebase));
          if (callback) callback(dadosFirebase);
          return dadosFirebase;
        } else {
          // Se não tem na nuvem, pega do LocalStorage
          return carregarDoLocal(callback);
        }
      })
      .catch(() => {
        // Se erro no Firebase, pega do LocalStorage
        return carregarDoLocal(callback);
      });
  } else {
    // Offline - carrega do LocalStorage
    return carregarDoLocal(callback);
  }
}

// Carregar do LocalStorage apenas
function carregarDoLocal(callback) {
  const dados = localStorage.getItem(APP_KEY);
  const parsed = dados ? JSON.parse(dados) : null;
  console.log("💾 Dados carregados do local");
  if (callback) callback(parsed);
  return parsed;
}

// ================================
// SINCRONIZAÇÃO AUTOMÁTICA
// ================================

// Quando voltar online, sincroniza dados pendentes
window.addEventListener('online', () => {
  console.log('🔄 Voltou online - Sincronizando dados pendentes...');
  const dadosLocais = carregarDoLocal();
  if (dadosLocais && dbRef) {
    dbRef.set(dadosLocais)
      .then(() => console.log('✅ Sincronização completa!'))
      .catch(erro => console.log('❌ Erro na sincronização:', erro));
  }
});

// Escuta mudanças no Firebase (em tempo real)
if (dbRef) {
  dbRef.on('value', (snapshot) => {
    const dados = snapshot.val();
    if (dados) {
      console.log('📥 Novos dados recebidos da nuvem');
      localStorage.setItem(APP_KEY, JSON.stringify(dados));
    }
  });
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
  if (dbRef) dbRef.remove();
  console.log("Usuário deslogado");
}

// ================================
// VENDAS
// ================================
function salvarVenda(produto, valor) {
  carregarDados((dados) => {
    if (!dados || !dados.logado) {
      alert("Usuário não logado");
      return;
    }

    const venda = {
      id: Date.now(),
      produto: produto || "Gás 13kg",
      valor: valor || 120,
      data: new Date().toLocaleString()
    };

    dados.vendas.push(venda);
    salvarDados(dados);

    console.log("Venda salva:", venda);
    alert("Venda salva com sucesso!");
  });
}

console.log('💾 Storage.js carregado - Sincronização Local + Firebase ativa');
