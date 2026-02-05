// ==========================================
// FIREBASE - GasAgua Pro
// ==========================================

const firebaseConfig = {
  databaseURL: "https://gasagua-pro-default-rtdb.firebaseio.com/"
};

// Inicializa
let database, dbRef;

try {
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  dbRef = database.ref('sistema');
  console.log("🔥 Firebase conectado!");
} catch (e) {
  console.error("❌ Erro Firebase:", e);
}

// ==========================================
// FUNÇÕES PARA O SISTEMA
// ==========================================

// Salvar dados (chamado pelo seu sistema)
window.salvarNaNuvem = function(dados) {
  if (!dbRef) return Promise.reject("Offline");
  
  // Adiciona timestamp
  dados.ultimaAtualizacao = new Date().toISOString();
  
  return dbRef.set(dados)
    .then(() => {
      console.log("✅ Dados salvos na nuvem!");
      return true;
    })
    .catch(erro => {
      console.error("❌ Erro:", erro);
      return false;
    });
};

// Carregar dados (chamado ao iniciar)
window.carregarDaNuvem = function(callback) {
  if (!dbRef) {
    if (callback) callback(null);
    return;
  }
  
  dbRef.once('value')
    .then((snapshot) => {
      const dados = snapshot.val();
      if (dados) {
        console.log("☁️ Dados carregados da nuvem:", dados);
        if (callback) callback(dados);
      } else {
        console.log("ℹ️ Nenhum dado na nuvem");
        if (callback) callback(null);
      }
    })
    .catch((erro) => {
      console.error("❌ Erro ao carregar:", erro);
      if (callback) callback(null);
    });
};

// Verifica conexão
database.ref('.info/connected').on('value', (snap) => {
  const conectado = snap.val();
  console.log(conectado ? "🟢 Online" : "🔴 Offline");
  window.firebaseOnline = conectado;
});

console.log("✅ Firebase pronto!");
