// ==========================================
// FIREBASE CONFIG - GasAgua Pro
// ==========================================

const firebaseConfig = {
  databaseURL: "https://gasagua-pro-default-rtdb.firebaseio.com/"
};

// Inicializa Firebase
let database, dbRef;

try {
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  dbRef = database.ref('sistema');
  console.log("🔥 Firebase conectado com sucesso!");
} catch (e) {
  console.error("❌ Erro ao conectar Firebase:", e);
}

// ==========================================
// FUNÇÕES GLOBAIS (disponíveis para todo o sistema)
// ==========================================

// Salvar dados na nuvem
window.salvarNaNuvem = function(dados) {
  if (!dbRef) {
    console.error("Firebase não disponível");
    return Promise.resolve(false);
  }
  
  // Adiciona timestamp
  dados.ultimaAtualizacao = new Date().toISOString();
  dados.versao = "1.0";
  
  return dbRef.set(dados)
    .then(() => {
      console.log("✅ Dados salvos na nuvem!");
      return true;
    })
    .catch(erro => {
      console.error("❌ Erro ao salvar na nuvem:", erro);
      return false;
    });
};

// Carregar dados da nuvem
window.carregarDaNuvem = function(callback) {
  if (!dbRef) {
    console.error("Firebase não disponível");
    if (callback) callback(null);
    return;
  }
  
  dbRef.once('value')
    .then((snapshot) => {
      const dados = snapshot.val();
      if (dados) {
        console.log("☁️ Dados carregados da nuvem");
        if (callback) callback(dados);
      } else {
        console.log("ℹ️ Nenhum dado encontrado na nuvem");
        if (callback) callback(null);
      }
    })
    .catch((erro) => {
      console.error("❌ Erro ao carregar:", erro);
      if (callback) callback(null);
    });
};

// Verificar status da conexão
database.ref('.info/connected').on('value', (snap) => {
  const conectado = snap.val();
  window.firebaseOnline = conectado;
  console.log(conectado ? "🟢 Firebase Online" : "🔴 Firebase Offline");
});

console.log("✅ Firebase Config carregado!");
console.log("Funções disponíveis: salvarNaNuvem(), carregarDaNuvem()");
