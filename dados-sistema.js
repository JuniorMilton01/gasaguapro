// dados-sistema.js - CONTROLE DE DADOS DO SISTEMA
import { 
  salvarDados, 
  buscarDados, 
  atualizarDados, 
  excluirDados,
  escutarMudancas 
} from './firebase-config.js';

// ===== CLIENTES =====
export async function salvarCliente(cliente) {
  // Se tem ID, atualiza. Se não tem, cria novo
  if (cliente.id) {
    await atualizarDados('clientes', cliente.id, cliente);
    return cliente.id;
  } else {
    const resultado = await salvarDados('clientes', cliente);
    return resultado.id;
  }
}

export async function carregarClientes() {
  return await buscarDados('clientes');
}

export async function excluirCliente(id) {
  return await excluirDados('clientes', id);
}

// Escuta mudanças em tempo real
export function escutarClientes(callback) {
  return escutarMudancas('clientes', callback);
}

// ===== PEDIDOS =====
export async function salvarPedido(pedido) {
  if (pedido.id) {
    await atualizarDados('pedidos', pedido.id, pedido);
    return pedido.id;
  } else {
    const resultado = await salvarDados('pedidos', pedido);
    return resultado.id;
  }
}

export async function carregarPedidos() {
  return await buscarDados('pedidos');
}

export async function excluirPedido(id) {
  return await excluirDados('pedidos', id);
}

export function escutarPedidos(callback) {
  return escutarMudancas('pedidos', callback);
}

// ===== PRODUTOS =====
export async function salvarProduto(produto) {
  if (produto.id) {
    await atualizarDados('produtos', produto.id, produto);
    return produto.id;
  } else {
    const resultado = await salvarDados('produtos', produto);
    return resultado.id;
  }
}

export async function carregarProdutos() {
  return await buscarDados('produtos');
}

export async function excluirProduto(id) {
  return await excluirDados('produtos', id);
}

export function escutarProdutos(callback) {
  return escutarMudancas('produtos', callback);
}

// ===== VENDAS =====
export async function salvarVenda(venda) {
  if (venda.id) {
    await atualizarDados('vendas', venda.id, venda);
    return venda.id;
  } else {
    const resultado = await salvarDados('vendas', venda);
    return resultado.id;
  }
}

export async function carregarVendas() {
  return await buscarDados('vendas');
}

export async function excluirVenda(id) {
  return await excluirDados('vendas', id);
}

export function escutarVendas(callback) {
  return escutarMudancas('vendas', callback);
}