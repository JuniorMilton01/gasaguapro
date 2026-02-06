// ==========================================
// APP PRINCIPAL - GasAgua Pro
// Substitui index-B_0g4mRk.js
// ==========================================

// Aguarda os scripts carregarem
document.addEventListener('DOMContentLoaded', function() {
  
  // Verifica se React está disponível
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('React não carregado!');
    document.getElementById('root').innerHTML = '<div style="padding:20px;color:red">Erro: React não carregado. Verifique a conexão.</div>';
    return;
  }

  const { useEffect, useState } = React;

  function App() {
    // Estado principal que contém TODOS os dados do sistema
    const [dadosSistema, setDadosSistema] = useState(function() {
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

    // ATIVA O AUTO-SAVE!
    useEffect(function() {
      if (typeof window.ativarAutoSave === 'function') {
        // Ativa auto-save passando função que retorna os dados atuais
        const desativarAutoSave = window.ativarAutoSave(function() { 
          return dadosSistema; 
        }, 3000);
        
        // Limpa ao desmontar
        return function() {
          if (desativarAutoSave) desativarAutoSave();
        };
      }
    }, []); // Executa apenas uma vez ao montar

    // Sempre que dados mudarem, atualiza o auto-save
    useEffect(function() {
      // Atualiza a referência global para o auto-save pegar dados atualizados
      window.obterDadosSistema = function() { 
        return dadosSistema; 
      };
    }, [dadosSistema]);

    // ==========================================
    // FUNÇÕES DE MANIPULAÇÃO DE DADOS
    // ==========================================

    // Função para atualizar dados (SEMPRE use esta!)
    const atualizarDados = function(novosDados) {
      setDadosSistema(novosDados);
      // O auto-save vai detectar a mudança e salvar automaticamente!
    };

    // Exemplo: Adicionar venda
    const adicionarVenda = function(venda) {
      const novoDados = Object.assign({}, dadosSistema, {
        vendas: dadosSistema.vendas.concat([{
          id: Date.now(),
          cliente: venda.cliente,
          produto: venda.produto,
          quantidade: venda.quantidade,
          valor: venda.valor,
          data: new Date().toISOString()
        }])
      });
      atualizarDados(novoDados);
    };

    // Exemplo: Adicionar cliente
    const adicionarCliente = function(cliente) {
      const novoDados = Object.assign({}, dadosSistema, {
        clientes: dadosSistema.clientes.concat([{
          id: Date.now(),
          nome: cliente.nome,
          telefone: cliente.telefone,
          endereco: cliente.endereco,
          dataCadastro: new Date().toISOString()
        }])
      });
      atualizarDados(novoDados);
    };

    // Exemplo: Atualizar estoque
    const atualizarEstoque = function(produto) {
      const estoqueAtual = dadosSistema.estoque || [];
      const produtoExistente = estoqueAtual.find(function(p) { 
        return p.id === produto.id; 
      });
      
      let novoEstoque;
      if (produtoExistente) {
        novoEstoque = estoqueAtual.map(function(p) { 
          return p.id === produto.id 
            ? Object.assign({}, p, produto, { dataAtualizacao: new Date().toISOString() }) 
            : p; 
        });
      } else {
        novoEstoque = estoqueAtual.concat([Object.assign({}, produto, { 
          id: Date.now(), 
          dataCadastro: new Date().toISOString() 
        })]);
      }
      
      atualizarDados(Object.assign({}, dadosSistema, {
        estoque: novoEstoque
      }));
    };

    // Forçar salvamento manual
    const salvarManualmente = function() {
      if (typeof window.salvarAgora === 'function') {
        window.salvarAgora();
        alert("💾 Dados salvos com sucesso!");
      }
    };

    // ==========================================
    // INTERFACE DO USUÁRIO
    // ==========================================

    // Estado para controle de telas
    const [telaAtiva, setTelaAtiva] = useState('dashboard');

    // Se não estiver logado, mostra tela de login
    if (!dadosSistema.logado) {
      return React.createElement('div', {
        style: {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      }, 
        React.createElement('div', {
          style: {
            width: '100%',
            maxWidth: '400px',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }, [
          React.createElement('h1', {
            key: 'titulo',
            style: {
              textAlign: 'center',
              color: '#333',
              marginBottom: '10px',
              fontSize: '28px'
            }
          }, '🔥 GasAgua Pro'),
          
          React.createElement('p', {
            key: 'subtitulo',
            style: {
              textAlign: 'center',
              color: '#666',
              marginBottom: '30px'
            }
          }, 'Sistema de Gestão'),
          
          React.createElement(LoginForm, {
            key: 'login',
            onLogin: function() {
              atualizarDados(window.carregarDados());
            }
          })
        ])
      );
    }

    // Tela principal (logado)
    return React.createElement('div', { 
      style: { minHeight: '100vh', background: '#f5f5f5' } 
    }, [
      // Header
      React.createElement('header', {
        key: 'header',
        style: {
          background: 'white',
          padding: '15px 30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, [
        React.createElement('div', { key: 'logo' }, [
          React.createElement('h1', { 
            key: 'titulo',
            style: { margin: 0, fontSize: '24px', color: '#333' }
          }, '🔥 GasAgua Pro'),
          React.createElement('p', {
            key: 'usuario',
            style: { margin: '5px 0 0 0', color: '#666', fontSize: '14px' }
          }, 'Bem-vindo, ' + (dadosSistema.usuarioAtual ? dadosSistema.usuarioAtual.nome : 'Usuário'))
        ]),
        
        React.createElement('div', { key: 'acoes' }, [
          React.createElement('button', {
            key: 'salvar',
            onClick: salvarManualmente,
            style: {
              padding: '10px 20px',
              marginRight: '10px',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }
          }, '💾 Salvar'),
          
          React.createElement('button', {
            key: 'sair',
            onClick: function() {
              if (typeof window.logout === 'function') {
                window.logout();
                atualizarDados(window.carregarDados());
              }
            },
            style: {
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }
          }, 'Sair')
        ])
      ]),

      // Menu
      React.createElement('nav', {
        key: 'menu',
        style: {
          display: 'flex',
          gap: '5px',
          padding: '20px 30px 0',
          background: 'white',
          borderBottom: '1px solid #e0e0e0'
        }
      }, ['dashboard', 'vendas', 'clientes', 'estoque'].map(function(aba) {
        return React.createElement('button', {
          key: aba,
          onClick: function() { setTelaAtiva(aba); },
          style: {
            padding: '12px 24px',
            background: telaAtiva === aba ? '#667eea' : 'transparent',
            color: telaAtiva === aba ? 'white' : '#666',
            border: 'none',
            borderBottom: telaAtiva === aba ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }
        }, aba);
      })),

      // Conteúdo
      React.createElement('main', {
        key: 'conteudo',
        style: { padding: '30px' }
      }, 
        telaAtiva === 'dashboard' && React.createElement(Dashboard, { dados: dadosSistema }),
        telaAtiva === 'vendas' && React.createElement(Vendas, { 
          dados: dadosSistema, 
          onAddVenda: adicionarVenda 
        }),
        telaAtiva === 'clientes' && React.createElement(Clientes, { 
          dados: dadosSistema, 
          onAddCliente: adicionarCliente 
        }),
        telaAtiva === 'estoque' && React.createElement(Estoque, { 
          dados: dadosSistema, 
          onAddProduto: atualizarEstoque 
        })
      )
    ]);
  }

  // ==========================================
  // COMPONENTES AUXILIARES
  // ==========================================

  function LoginForm(props) {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');

    const tentarLogin = function() {
      if (typeof window.login === 'function') {
        if (window.login(nome, senha)) {
          props.onLogin();
        } else {
          alert('❌ Login falhou! Use admin / 123456 ou crie um usuário.');
        }
      }
    };

    const criarPadrao = function() {
      if (typeof window.salvarUsuario === 'function') {
        window.salvarUsuario({
          nome: 'admin',
          email: 'admin@gasagua.com',
          senha: '123456'
        });
        alert('✅ Usuário criado: admin / 123456');
      }
    };

    return React.createElement('div', { style: { marginTop: '20px' } }, [
      React.createElement('input', {
        key: 'nome',
        type: 'text',
        placeholder: 'Usuário',
        value: nome,
        onChange: function(e) { setNome(e.target.value); },
        style: {
          width: '100%',
          padding: '14px',
          marginBottom: '12px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '16px',
          boxSizing: 'border-box'
        }
      }),
      
      React.createElement('input', {
        key: 'senha',
        type: 'password',
        placeholder: 'Senha',
        value: senha,
        onChange: function(e) { setSenha(e.target.value); },
        style: {
          width: '100%',
          padding: '14px',
          marginBottom: '20px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '16px',
          boxSizing: 'border-box'
        }
      }),
      
      React.createElement('button', {
        key: 'entrar',
        onClick: tentarLogin,
        style: {
          width: '100%',
          padding: '14px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '15px'
        }
      }, 'Entrar'),
      
      React.createElement('button', {
        key: 'criar',
        onClick: criarPadrao,
        style: {
          width: '100%',
          padding: '12px',
          background: 'transparent',
          color: '#667eea',
          border: '2px solid #667eea',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer'
        }
      }, 'Criar Usuário Padrão')
    ]);
  }

  function Dashboard(props) {
    const dados = props.dados;
    
    return React.createElement('div', null, [
      React.createElement('div', {
        key: 'cards',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }
      }, [
        // Card Clientes
        React.createElement('div', {
          key: 'clientes',
          style: {
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }
        }, [
          React.createElement('h3', { 
            key: 'titulo',
            style: { margin: '0 0 10px 0', color: '#667eea' }
          }, '👥 Clientes'),
          React.createElement('p', {
            key: 'valor',
            style: { fontSize: '36px', margin: 0, fontWeight: 'bold', color: '#333' }
          }, dados.clientes ? dados.clientes.length : 0)
        ]),
        
        // Card Vendas
        React.createElement('div', {
          key: 'vendas',
          style: {
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }
        }, [
          React.createElement('h3', { 
            key: 'titulo',
            style: { margin: '0 0 10px 0', color: '#16a34a' }
          }, '🛒 Vendas'),
          React.createElement('p', {
            key: 'valor',
            style: { fontSize: '36px', margin: 0, fontWeight: 'bold', color: '#333' }
          }, dados.vendas ? dados.vendas.length : 0)
        ]),
        
        // Card Produtos
        React.createElement('div', {
          key: 'estoque',
          style: {
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }
        }, [
          React.createElement('h3', { 
            key: 'titulo',
            style: { margin: '0 0 10px 0', color: '#d97706' }
          }, '📦 Produtos'),
          React.createElement('p', {
            key: 'valor',
            style: { fontSize: '36px', margin: 0, fontWeight: 'bold', color: '#333' }
          }, dados.estoque ? dados.estoque.length : 0)
        ])
      ]),

      // Últimas vendas
      React.createElement('div', {
        key: 'ultimas',
        style: {
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }, [
        React.createElement('h3', { 
          key: 'titulo',
          style: { margin: '0 0 20px 0' }
        }, '📈 Últimas Vendas'),
        
        dados.vendas && dados.vendas.length > 0 
          ? dados.vendas.slice(-5).reverse().map(function(venda) {
              return React.createElement('div', {
                key: venda.id,
                style: {
                  padding: '10px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between'
                }
              }, [
                React.createElement('span', { key: 'info' }, 
                  venda.cliente + ' - ' + venda.produto
                ),
                React.createElement('span', { 
                  key: 'valor',
                  style: { fontWeight: 'bold' }
                }, 'R$ ' + venda.valor)
              ]);
            })
          : React.createElement('p', { style: { color: '#666' } }, 'Nenhuma venda registrada')
      ])
    ]);
  }

  function Vendas(props) {
    const [venda, setVenda] = useState({ cliente: '', produto: '', quantidade: 1, valor: '' });

    const salvar = function() {
      if (!venda.cliente || !venda.produto) {
        alert('Preencha todos os campos!');
        return;
      }
      props.onAddVenda(venda);
      setVenda({ cliente: '', produto: '', quantidade: 1, valor: '' });
      alert('✅ Venda registrada!');
    };

    return React.createElement('div', {
      style: {
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('h2', { key: 'titulo' }, '🛒 Nova Venda'),
      
      React.createElement('div', {
        key: 'form',
        style: { display: 'grid', gap: '12px', maxWidth: '400px', marginTop: '15px' }
      }, [
        React.createElement('input', {
          key: 'cliente',
          placeholder: 'Nome do cliente',
          value: venda.cliente,
          onChange: function(e) { setVenda(Object.assign({}, venda, { cliente: e.target.value })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('input', {
          key: 'produto',
          placeholder: 'Produto',
          value: venda.produto,
          onChange: function(e) { setVenda(Object.assign({}, venda, { produto: e.target.value })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('input', {
          key: 'quantidade',
          type: 'number',
          placeholder: 'Quantidade',
          value: venda.quantidade,
          onChange: function(e) { setVenda(Object.assign({}, venda, { quantidade: parseInt(e.target.value) || 0 })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('input', {
          key: 'valor',
          type: 'number',
          placeholder: 'Valor total',
          value: venda.valor,
          onChange: function(e) { setVenda(Object.assign({}, venda, { valor: parseFloat(e.target.value) || 0 })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('button', {
          key: 'btn',
          onClick: salvar,
          style: {
            padding: '12px',
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        }, 'Registrar Venda')
      ]),

      // Lista de vendas
      React.createElement('h3', { key: 'titulo-lista', style: { marginTop: '30px' } }, '📋 Histórico'),
      
      React.createElement('table', {
        key: 'tabela',
        style: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' }
      }, [
        React.createElement('thead', { key: 'head' }, 
          React.createElement('tr', { style: { background: '#f3f4f6' } }, [
            React.createElement('th', { key: 'd', style: { padding: '10px', textAlign: 'left' } }, 'Data'),
            React.createElement('th', { key: 'c', style: { padding: '10px', textAlign: 'left' } }, 'Cliente'),
            React.createElement('th', { key: 'p', style: { padding: '10px', textAlign: 'left' } }, 'Produto'),
            React.createElement('th', { key: 'v', style: { padding: '10px', textAlign: 'right' } }, 'Valor')
          ])
        ),
        
        React.createElement('tbody', { key: 'body' },
          (props.dados.vendas || []).slice().reverse().map(function(v) {
            return React.createElement('tr', { key: v.id, style: { borderBottom: '1px solid #e5e7eb' } }, [
              React.createElement('td', { key: 'd', style: { padding: '10px' } }, v.data),
              React.createElement('td', { key: 'c', style: { padding: '10px' } }, v.cliente),
              React.createElement('td', { key: 'p', style: { padding: '10px' } }, v.produto),
              React.createElement('td', { key: 'v', style: { padding: '10px', textAlign: 'right' } }, 'R$ ' + v.valor)
            ]);
          })
        )
      ])
    ]);
  }

  function Clientes(props) {
    const [cliente, setCliente] = useState({ nome: '', telefone: '', endereco: '' });

    const salvar = function() {
      if (!cliente.nome) {
        alert('Nome é obrigatório!');
        return;
      }
      props.onAddCliente(cliente);
      setCliente({ nome: '', telefone: '', endereco: '' });
      alert('✅ Cliente cadastrado!');
    };

    return React.createElement('div', {
      style: {
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('h2', { key: 'titulo' }, '👥 Cadastrar Cliente'),
      
      React.createElement('div', {
        key: 'form',
        style: { display: 'grid', gap: '12px', maxWidth: '400px', marginTop: '15px', marginBottom: '30px' }
      }, [
        React.createElement('input', {
          key: 'nome',
          placeholder: 'Nome completo',
          value: cliente.nome,
          onChange: function(e) { setCliente(Object.assign({}, cliente, { nome: e.target.value })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('input', {
          key: 'tel',
          placeholder: 'Telefone',
          value: cliente.telefone,
          onChange: function(e) { setCliente(Object.assign({}, cliente, { telefone: e.target.value })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('input', {
          key: 'end',
          placeholder: 'Endereço',
          value: cliente.endereco,
          onChange: function(e) { setCliente(Object.assign({}, cliente, { endereco: e.target.value })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('button', {
          key: 'btn',
          onClick: salvar,
          style: {
            padding: '12px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        }, 'Cadastrar Cliente')
      ]),

      React.createElement('h3', { key: 'titulo-lista' }, '📋 Clientes Cadastrados'),
      
      React.createElement('div', {
        key: 'lista',
        style: { display: 'grid', gap: '10px', marginTop: '15px' }
      }, (props.dados.clientes || []).map(function(c) {
        return React.createElement('div', {
          key: c.id,
          style: {
            padding: '15px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }
        }, [
          React.createElement('strong', { key: 'nome' }, c.nome),
          React.createElement('br', { key: 'br' }),
          React.createElement('span', { 
            key: 'info',
            style: { color: '#666', fontSize: '14px' }
          }, '📞 ' + (c.telefone || 'Sem telefone') + ' | 📍 ' + (c.endereco || 'Sem endereço'))
        ]);
      }))
    ]);
  }

  function Estoque(props) {
    const [produto, setProduto] = useState({ nome: '', tipo: 'gas', quantidade: 0, preco: 0 });

    const salvar = function() {
      if (!produto.nome) {
        alert('Nome é obrigatório!');
        return;
      }
      props.onAddProduto(produto);
      setProduto({ nome: '', tipo: 'gas', quantidade: 0, preco: 0 });
      alert('✅ Produto cadastrado!');
    };

    return React.createElement('div', {
      style: {
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('h2', { key: 'titulo' }, '📦 Cadastrar Produto'),
      
      React.createElement('div', {
        key: 'form',
        style: { display: 'grid', gap: '12px', maxWidth: '400px', marginTop: '15px', marginBottom: '30px' }
      }, [
        React.createElement('input', {
          key: 'nome',
          placeholder: 'Nome do produto',
          value: produto.nome,
          onChange: function(e) { setProduto(Object.assign({}, produto, { nome: e.target.value })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('select', {
          key: 'tipo',
          value: produto.tipo,
          onChange: function(e) { setProduto(Object.assign({}, produto, { tipo: e.target.value })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }, [
          React.createElement('option', { key: 'gas', value: 'gas' }, '🔥 Gás'),
          React.createElement('option', { key: 'agua', value: 'agua' }, '💧 Água')
        ]),
        
        React.createElement('input', {
          key: 'qtd',
          type: 'number',
          placeholder: 'Quantidade em estoque',
          value: produto.quantidade,
          onChange: function(e) { setProduto(Object.assign({}, produto, { quantidade: parseInt(e.target.value) || 0 })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('input', {
          key: 'preco',
          type: 'number',
          placeholder: 'Preço unitário',
          value: produto.preco,
          onChange: function(e) { setProduto(Object.assign({}, produto, { preco: parseFloat(e.target.value) || 0 })); },
          style: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }
        }),
        
        React.createElement('button', {
          key: 'btn',
          onClick: salvar,
          style: {
            padding: '12px',
            background: '#d97706',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        }, 'Cadastrar Produto')
      ]),

      React.createElement('h3', { key: 'titulo-lista' }, '📦 Produtos em Estoque'),
      
      React.createElement('div', {
        key: 'lista',
        style: { 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '15px', 
          marginTop: '15px' 
        }
      }, (props.dados.estoque || []).map(function(p) {
        return React.createElement('div', {
          key: p.id,
          style: {
            padding: '15px',
            background: p.tipo === 'gas' ? '#fef3c7' : '#dbeafe',
            borderRadius: '8px',
            border: '2px solid ' + (p.tipo === 'gas' ? '#f59e0b' : '#3b82f6')
          }
        }, [
          React.createElement('div', {
            key: 'badge',
            style: {
              display: 'inline-block',
              padding: '4px 8px',
              background: p.tipo === 'gas' ? '#f59e0b' : '#3b82f6',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '8px'
            }
          }, p.tipo === 'gas' ? '🔥 Gás' : '💧 Água'),
          
          React.createElement('h4', { key: 'nome', style: { margin: '10px 0 5px 0' } }, p.nome),
          
          React.createElement('p', { 
            key: 'info',
            style: { margin: 0, color: '#666' }
          }, 'Estoque: ' + p.quantidade + ' unidades'),
          
          React.createElement('p', { 
            key: 'preco',
            style: { margin: '5px 0 0 0', fontWeight: 'bold' }
          }, 'R$ ' + p.preco)
        ]);
      }))
    ]);
  }

  // Inicializa o app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
  
  console.log('✅ App inicializado com sucesso!');
});
