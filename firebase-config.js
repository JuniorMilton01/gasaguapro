// ==========================================
// FIREBASE CONNECTION - GasAgua Pro
// ==========================================

// Configuração
const firebaseConfig = {
  databaseURL: "https://gasagua-pro-default-rtdb.firebaseio.com/"
};

// Inicializa Firebase
let app, database, dbRef;

try {
  app = firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  dbRef = database.ref('sistema');
  console.log("🔥 Firebase inicializado com sucesso!");
} catch (e) {
  console.error("❌ Erro ao inicializar Firebase:", e);
}

// ==========================================
// FUNÇÕES GLOBAIS (Disponíveis para todo o sistema)
// ==========================================

// Salvar dados no Firebase
window.salvarNaNuvem = function(caminho, dados) {
  if (!dbRef) {
    console.error("Firebase não disponível");
    return Promise.reject("Firebase offline");
  }
  
  return dbRef.child(caminho).set(dados)
    .then(() => {
      console.log("✅ Salvo na nuvem:", caminho);
      return true;
    })
    .catch(erro => {
      console.error("❌ Erro ao salvar:", erro);
      return false;
    });
};

// Ler dados do Firebase
window.lerDaNuvem = function(caminho, callback) {
  if (!dbRef) {
    console.error("Firebase não disponível");
    return;
  }
  
  dbRef.child(caminho).on('value', (snapshot) => {
    const dados = snapshot.val();
    console.log("📥 Dados recebidos:", caminho, dados);
    if (callback) callback(dados);
  });
};

// Salvar TUDO (sistema completo)
window.salvarSistemaCompleto = function(dados) {
  if (!dbRef) return Promise.reject("Firebase offline");
  
  const dadosComTimestamp = {
    ...dados,
    ultimaAtualizacao: new Date().toISOString(),
    versao: "1.0"
  };
  
  return dbRef.set(dadosComTimestamp)
    .then(() => {
      console.log("✅ Sistema completo sincronizado!");
      return true;
    })
    .catch(erro => {
      console.error("❌ Erro na sincronização:", erro);
      return false;
    });
};

// Carregar TUDO
window.carregarSistemaCompleto = function(callback) {
  if (!dbRef) {
    console.error("Firebase não disponível");
    return;
  }
  
  dbRef.once('value')
    .then((snapshot) => {
      const dados = snapshot.val();
      console.log("☁️ Sistema carregado da nuvem:", dados);
      if (callback) callback(dados);
    })
    .catch((erro) => {
      console.error("❌ Erro ao carregar:", erro);
      if (callback) callback(null);
    });
};

// Status da conexão
database.ref('.info/connected').on('value', (snap) => {
  const status = snap.val() ? "ONLINE" : "OFFLINE";
  console.log(`🌐 Firebase: ${status}`);
  window.firebaseStatus = status;
});

console.log("✅ Firebase Connection carregado!");
console.log("Funções disponíveis: salvarNaNuvem(), lerDaNuvem(), salvarSistemaCompleto(), carregarSistemaCompleto()");
