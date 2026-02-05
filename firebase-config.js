// Configuração do Firebase - Gasagua Pro
const firebaseConfig = {
  databaseURL: "https://gasagua-pro-default-rtdb.firebaseio.com/"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log("🔥 Firebase conectado com sucesso!");

// ========== FUNÇÕES PARA USAR NO SISTEMA ==========

// Salvar dados (clientes, pedidos, etc)
function salvarDados(caminho, dados) {
  return database.ref(caminho).set(dados)
    .then(() => {
      console.log("✅ Dados salvos em:", caminho);
      return true;
    })
    .catch(erro => {
      console.log("❌ Erro ao salvar:", erro);
      return false;
    });
}

// Ler dados em tempo real
function lerDados(caminho, callback) {
  database.ref(caminho).on('value', (snapshot) => {
    const dados = snapshot.val();
    callback(dados);
    console.log("📥 Dados lidos de:", caminho);
  });
}

// Detecta status da conexão (online/offline)
database.ref('.info/connected').on('value', (snap) => {
  if (snap.val() === true) {
    console.log('🟢 ONLINE - Sincronizando com servidor');
    document.body.classList.remove('offline');
  } else {
    console.log('🔴 OFFLINE - Modo local ativado');
    document.body.classList.add('offline');
  }
});

// Exemplo: Salvar um cliente
// salvarDados('clientes/cliente001', {
//   nome: 'João Silva',
//   telefone: '11999999999',
//   endereco: 'Rua ABC, 123'
// });

// Exemplo: Ler todos os clientes
// lerDados('clientes', (dados) => {
//   console.log('Clientes:', dados);
// });
