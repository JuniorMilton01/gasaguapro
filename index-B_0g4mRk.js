// ==========================================
// INTEGRAÇÃO COM AUTO-SAVE (Adicionar no App principal)
// ==========================================

import { useEffect, useState } from 'react';

function App() {
  // Seu estado principal que contém TODOS os dados do sistema
  const [dadosSistema, setDadosSistema] = useState(() => {
    // Carrega dados ao iniciar
    if (typeof window.carregarDados === 'function') {
      return window.carregarDados();
    }
    return {
      logado: false,
      usuarios: [],
      vendas: [],
      clientes: [],
      estoque: [],
      ultimoAcesso: null
    };
  });

  // ATIVA O AUTO-SAVE! (ESSENCIAL!)
  useEffect(() => {
    if (typeof window.ativarAutoSave === 'function') {
      // Ativa auto-save passando função que retorna os dados atuais
      const desativarAutoSave = window.ativarAutoSave(() => dadosSistema, 3000);
      
      // Limpa ao desmontar
      return () => {
        if (desativarAutoSave) desativarAutoSave();
      };
    }
  }, []); // Executa apenas uma vez ao montar

  // Sempre que dados mudarem, atualiza o auto-save
  useEffect(() => {
    // Atualiza a referência global para o auto-save pegar dados atualizados
    if (typeof window.obterDadosSistema === 'function') {
      window.obterDadosSistema = () => dadosSistema;
    }
  }, [dadosSistema]);

  // ==========================================
  // FUNÇÕES DE MANIPULAÇÃO DE DADOS
  // ==========================================

  // Função para atualizar dados (SEMPRE use esta!)
  const atualizarDados = (novosDados) => {
    setDadosSistema(novosDados);
    // O auto-save vai detectar a mudança e salvar automaticamente!
  };

  // Exemplo: Adicionar venda
  const adicionarVenda = (venda) => {
    const novoDados = {
      ...dadosSistema,
      vendas: [...dadosSistema.vendas, {
        id: Date.now(),
        ...venda,
        data: new Date().toISOString()
      }]
    };
    atualizarDados(novoDados);
  };

  // Exemplo: Adicionar cliente
  const adicionarCliente = (cliente) => {
    const novoDados = {
      ...dadosSistema,
      clientes: [...dadosSistema.clientes, {
        id: Date.now(),
        ...cliente,
        dataCadastro: new Date().toISOString()
      }]
    };
    atualizarDados(novoDados);
  };

  // Exemplo: Atualizar estoque
  const atualizarEstoque = (produto) => {
    const estoqueAtual = dadosSistema.estoque || [];
    const produtoExistente = estoqueAtual.find(p => p.id === produto.id);
    
    let novoEstoque;
    if (produtoExistente) {
      novoEstoque = estoqueAtual.map(p => 
        p.id === produto.id ? { ...p, ...produto, dataAtualizacao: new Date().toISOString() } : p
      );
    } else {
      novoEstoque = [...estoqueAtual, { ...produto, id: Date.now(), dataCadastro: new Date().toISOString() }];
    }
    
    atualizarDados({
      ...dadosSistema,
      estoque: novoEstoque
    });
  };

  // Forçar salvamento manual (útil para botão "Salvar")
  const salvarManualmente = () => {
    if (typeof window.salvarAgora === 'function') {
      window.salvarAgora();
      alert("💾 Dados salvos com sucesso!");
    }
  };

  // ... resto do seu componente

  return (
    <div>
      {/* Seu JSX aqui */}
      <button onClick={salvarManualmente}>
        💾 Salvar Agora
      </button>
    </div>
  );
}

export default App;
