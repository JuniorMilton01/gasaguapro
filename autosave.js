// ==========================================
// AUTO-SAVE INTEGRATION - GasAgua Pro
// Arquivo: autosave.js
// Colocar na pasta raiz junto com index.html
// ==========================================

console.log("⏱️ Auto-Save Integration carregando...");

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const CONFIG = {
  intervaloAutoSave: 3000,      // Salva a cada 3 segundos
  delayInicial: 2000,           // Aguarda 2s antes de iniciar
  salvarAoSair: true,           // Salva ao fechar página
  salvarAoMudarAba: true,       // Salva ao trocar de aba
  debug: true                   // Mostra logs no console
};

// ==========================================
// VARIÁVEIS INTERNAS
// ==========================================

let timerAutoSave = null;
let ultimosDadosSalvos = null;
let sistemaPronto = false;

// ==========================================
// FUNÇÃO PARA OBTER DADOS DO SISTEMA
// ==========================================

function obterDadosSistema() {
  // Tenta várias formas de obter os dados do React/estado global
  
  // Opção 1: Função global exposta pelo React
  if (typeof window.obterDadosSistema === 'function') {
    return window.obterDadosSistema();
  }
  
  // Opção 2: Variável global do sistema
  if (window.dadosSistema) {
    return window.dadosSistema;
  }
  
  // Opção 3: Tenta ler do DOM (último recurso)
  const dadosDOM = extrairDadosDoDOM();
  if (dadosDOM) return dadosDOM;
  
  return null;
}

// ==========================================
// EXTRAÇÃO DE DADOS DO DOM (Fallback)
// ==========================================

function extrairDadosDoDOM() {
  const dados = {
    ultimaAtualizacao: new Date().toISOString(),
    versao: "1.0",
    extraidoDOM: true
  };
  
  // Tenta encontrar inputs comuns do sistema
  const inputs = document.querySelectorAll('input[data-field], textarea[data-field], select[data-field]');
  
  if (inputs.length === 0) return null;
  
  inputs.forEach(input => {
    const campo = input.getAttribute('data-field');
    if (campo) {
      dados[campo] = input.value;
    }
  });
  
  return Object.keys(dados).length > 2 ? dados : null;
}

// ==========================================
// FUNÇÃO PRINCIPAL DE SALVAMENTO
// ==========================================

function executarAutoSave(forcar = false) {
  const dados = obterDadosSistema();
  
  if (!dados) {
    if (CONFIG.debug) console.log("⏳ Aguardando dados do sistema...");
    return;
  }
  
  // Verifica se os dados realmente mudaram (evita salvamento desnecessário)
  const dadosString = JSON.stringify(dados);
  if (!forcar && dadosString === ultimosDadosSalvos) {
    return; // Dados iguais, não salva
  }
  
  // Executa o salvamento
  if (typeof salvarDados === 'function') {
    salvarDados(dados);
    ultimosDadosSalvos = dadosString;
    
    if (CONFIG.debug) console.log("💾 Auto-save executado:", new Date().toLocaleTimeString());
  } else if (typeof window.salvarNaNuvem === 'function') {
    // Fallback: salva direto na nuvem
    window.salvarNaNuvem(dados);
    ultimosDadosSalvos = dadosString;
    
    if (CONFIG.debug) console.log("☁️ Auto-save (nuvem) executado");
  } else {
    if (CONFIG.debug) console.log("⚠️ Função de salvamento não encontrada");
  }
}

// ==========================================
// EVENTOS DE SALVAMENTO
// ==========================================

function configurarEventos() {
  
  // 1. Salvar ao fechar a página (beforeunload)
  if (CONFIG.salvarAoSair) {
    window.addEventListener('beforeunload', (e) => {
      executarAutoSave(true); // Força salvamento
      
      // Não mostra confirmação se já salvou
      if (ultimosDadosSalvos) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
  
  // 2. Salvar ao mudar de aba/ficar invisível
  if (CONFIG.salvarAoMudarAba) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        executarAutoSave(true); // Força salvamento ao sair da aba
        if (CONFIG.debug) console.log("👋 Salvando ao sair da aba...");
      } else {
        // Voltou para a aba
        if (CONFIG.debug) console.log("👀 Voltou para a aba");
      }
    });
  }
  
  // 3. Salvar ao perder foco do window (blur)
  window.addEventListener('blur', () => {
    executarAutoSave(true);
  });
  
  // 4. Detecta cliques em botões de "Sair", "Fechar", "Logout"
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a');
    if (!target) return;
    
    const texto = target.textContent.toLowerCase();
    const acoesSaida = ['sair', 'fechar', 'logout', 'encerrar', 'voltar', 'cancelar'];
    
    if (acoesSaida.some(acao => texto.includes(acao))) {
      executarAutoSave(true);
      if (CONFIG.debug) console.log("🚪 Detectado clique em sair/fechar - salvando...");
    }
  });
  
  // 5. Detecta formulários sendo enviados
  document.addEventListener('submit', (e) => {
    executarAutoSave(true);
    if (CONFIG.debug) console.log("📤 Formulário enviado - salvando...");
  });
}

// ==========================================
// INICIALIZAÇÃO DO AUTO-SAVE
// ==========================================

function iniciarAutoSave() {
  if (timerAutoSave) {
    clearInterval(timerAutoSave);
  }
  
  // Loop principal de auto-save
  timerAutoSave = setInterval(() => {
    if (sistemaPronto) {
      executarAutoSave();
    }
  }, CONFIG.intervaloAutoSave);
  
  console.log("✅ Auto-Save ativado! Intervalo:", CONFIG.intervaloAutoSave + "ms");
}

// ==========================================
// PARAR AUTO-SAVE
// ==========================================

function pararAutoSave() {
  if (timerAutoSave) {
    clearInterval(timerAutoSave);
    timerAutoSave = null;
    console.log("⏹️ Auto-Save desativado");
  }
}

// ==========================================
// API PÚBLICA (exposta globalmente)
// ==========================================

window.AutoSave = {
  iniciar: iniciarAutoSave,
  parar: pararAutoSave,
  salvarAgora: () => executarAutoSave(true),
  configurar: (novasConfig) => {
    Object.assign(CONFIG, novasConfig);
    console.log("⚙️ Configurações atualizadas:", CONFIG);
  },
  status: () => ({
    ativo: !!timerAutoSave,
    ultimoSalvamento: ultimosDadosSalvos ? new Date().toISOString() : null,
    sistemaPronto: sistemaPronto
  })
};

// ==========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Aguarda o sistema carregar completamente
  setTimeout(() => {
    sistemaPronto = true;
    configurarEventos();
    iniciarAutoSave();
    
    // Primeiro salvamento
    executarAutoSave(true);
    
  }, CONFIG.delayInicial);
});

// ==========================================
// DETECÇÃO DE MUDANÇAS NO LOCALSTORAGE (Sincronização entre abas)
// ==========================================

window.addEventListener('storage', (e) => {
  if (e.key === 'gasaguapro') {
    if (CONFIG.debug) console.log("🔄 Dados atualizados em outra aba");
    // Opcional: recarregar dados se necessário
  }
});

console.log("✨ Auto-Save Integration carregado! Use: window.AutoSave");
