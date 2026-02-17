// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SUBSTITUA ESTES DADOS PELOS SEUS DO PASSO 3
const firebaseConfig = {
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5Jy8O1WvnJYzL1JMjWB_PUckR3J7nBNA",
  authDomain: "gasaguapro.firebaseapp.com",
  databaseURL: "https://gasaguapro-default-rtdb.firebaseio.com",
  projectId: "gasaguapro",
  storageBucket: "gasaguapro.firebasestorage.app",
  messagingSenderId: "1085068263719",
  appId: "1:1085068263719:web:ad3ff44b61a373a1952902"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para salvar dados com data de expiração (6 meses)
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
    console.log("Documento salvo com ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao salvar:", e);
    throw e;
  }
}

// Função para buscar dados (apenas não expirados)
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
    return dados;
  } catch (e) {
    console.error("Erro ao buscar:", e);
    throw e;
  }
}

// Função para excluir dados expirados (executar periodicamente)
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
    console.log(`${promessasExclusao.length} documentos expirados removidos`);
  } catch (e) {
    console.error("Erro ao limpar dados:", e);
  }
}

export { db };