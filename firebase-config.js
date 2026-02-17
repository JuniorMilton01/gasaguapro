// firebase-config.js
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
  Timestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ CONFIGURAÇÃO LIMPA - sem código dentro do objeto
const firebaseConfig = {
  apiKey: "AIzaSyA5Jy8O1WvnJYzL1JMjWB_PUckR3J7nBNA",
  authDomain: "gasaguapro.firebaseapp.com",
  databaseURL: "https://gasaguapro-default-rtdb.firebaseio.com",
  projectId: "gasaguapro",
  storageBucket: "gasaguapro.firebasestorage.app",
  messagingSenderId: "1085068263719",
  appId: "1:1085068263719:web:ad3ff44b61a373a1952902"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ FUNÇÃO PARA SALVAR DADOS (com expiração de 6 meses)
export async function salvarDados(colecao, dados) {
  const dataExpiracao = new Date();
  dataExpiracao.setMonth(dataExpiracao.getMonth() + 6);
  
  const dadosComExpiracao = {
    ...dados,
    criadoEm: Timestamp.now(),
    expiraEm: Timestamp.fromDate(dataExpiracao)
  };
  
  try {
    const docRef = await addDoc(collection(db, colecao), dadosComExpiracao);
    console.log("✅ Documento salvo com ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Erro ao salvar:", e);
    throw e;
  }
}

// ✅ FUNÇÃO PARA BUSCAR DADOS (apenas não expirados)
export async function buscarDados(colecao) {
  try {
    const agora = Timestamp.now();
    const q = query(
      collection(db, colecao),
      where("expiraEm", ">", agora)
    );
    
    const querySnapshot = await getDocs(q);
    const dados = [];
    querySnapshot.forEach((doc) => {
      dados.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ ${dados.length} documentos encontrados em ${colecao}`);
    return dados;
  } catch (e) {
    console.error("❌ Erro ao buscar:", e);
    throw e;
  }
}

// ✅ FUNÇÃO PARA ATUALIZAR DADOS (importante para edições!)
export async function atualizarDados(colecao, id, dados) {
  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const docRef = doc(db, colecao, id);
    await updateDoc(docRef, {
      ...dados,
      atualizadoEm: Timestamp.now()
    });
    console.log("✅ Documento atualizado:", id);
  } catch (e) {
    console.error("❌ Erro ao atualizar:", e);
    throw e;
  }
}

// ✅ FUNÇÃO PARA EXCLUIR DADOS
export async function excluirDados(colecao, id) {
  try {
    await deleteDoc(doc(db, colecao, id));
    console.log("✅ Documento excluído:", id);
  } catch (e) {
    console.error("❌ Erro ao excluir:", e);
    throw e;
  }
}

// ✅ FUNÇÃO PARA LIMPAR DADOS EXPIRADOS
export async function limparDadosExpirados(colecao) {
  try {
    const agora = Timestamp.now();
    const q = query(
      collection(db, colecao),
      where("expiraEm", "<=", agora)
    );
    
    const querySnapshot = await getDocs(q);
    const promessasExclusao = [];
    
    querySnapshot.forEach((documento) => {
      promessasExclusao.push(deleteDoc(doc(db, colecao, documento.id)));
    });
    
    await Promise.all(promessasExclusao);
    console.log(`🗑️ ${promessasExclusao.length} documentos expirados removidos de ${colecao}`);
  } catch (e) {
    console.error("❌ Erro ao limpar dados:", e);
  }
}

export { db, app };
