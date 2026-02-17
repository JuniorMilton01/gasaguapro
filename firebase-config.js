// firebase-config.js - VERSÃO COMPLETA E SIMPLIFICADA
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  Timestamp,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== CONFIGURAÇÃO DO FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyA5Jy8O1WvnJYzL1JMjWB_PUckR3J7nBNA",
  authDomain: "gasaguapro.firebaseapp.com",
  databaseURL: "https://gasaguapro-default-rtdb.firebaseio.com",
  projectId: "gasaguapro",
  storageBucket: "gasaguapro.firebasestorage.app",
  messagingSenderId: "1085068263719",
  appId: "1:1085068263719:web:ad3ff44b61a373a1952902"
};

// Inicializa
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== FUNÇÃO PARA SALVAR (CRIA NOVO) =====
export async function salvarDados(colecao, dados) {
  try {
    const dadosComData = {
      ...dados,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, colecao), dadosComData);
    console.log(`✅ Salvo em ${colecao}:`, docRef.id);
    return { id: docRef.id, ...dadosComData };
  } catch (erro) {
    console.error(`❌ Erro ao salvar em ${colecao}:`, erro);
    throw erro;
  }
}

// ===== FUNÇÃO PARA ATUALIZAR (EDITAR EXISTENTE) =====
export async function atualizarDados(colecao, id, dados) {
  try {
    const docRef = doc(db, colecao, id);
    await updateDoc(docRef, {
      ...dados,
      atualizadoEm: Timestamp.now()
    });
    console.log(`✅ Atualizado em ${colecao}:`, id);
    return true;
  } catch (erro) {
    console.error(`❌ Erro ao atualizar em ${colecao}:`, erro);
    throw erro;
  }
}

// ===== FUNÇÃO PARA BUSCAR TODOS =====
export async function buscarDados(colecao) {
  try {
    const snapshot = await getDocs(collection(db, colecao));
    const dados = [];
    snapshot.forEach((doc) => {
      dados.push({ id: doc.id, ...doc.data() });
    });
    console.log(`📥 ${dados.length} itens carregados de ${colecao}`);
    return dados;
  } catch (erro) {
    console.error(`❌ Erro ao buscar ${colecao}:`, erro);
    throw erro;
  }
}

// ===== FUNÇÃO PARA EXCLUIR =====
export async function excluirDados(colecao, id) {
  try {
    await deleteDoc(doc(db, colecao, id));
    console.log(`🗑️ Excluído de ${colecao}:`, id);
    return true;
  } catch (erro) {
    console.error(`❌ Erro ao excluir de ${colecao}:`, erro);
    throw erro;
  }
}

// ===== FUNÇÃO ESPECIAL: ESCUTAR MUDANÇAS EM TEMPO REAL =====
export function escutarMudancas(colecao, callback) {
  console.log(`👂 Escutando mudanças em ${colecao}...`);
  
  return onSnapshot(collection(db, colecao), (snapshot) => {
    const dados = [];
    snapshot.forEach((doc) => {
      dados.push({ id: doc.id, ...doc.data() });
    });
    console.log(`🔄 Dados atualizados em ${colecao}:`, dados.length, 'itens');
    callback(dados);
  });
}

export { db, app };
