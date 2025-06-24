// src/pages/CartPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import cartService from '@services/cartService';
import { formatPrice } from '@assets/js/util';
import indisponivel3x2 from '@assets/img/indisponivel3x2.svg';
import '@assets/css/cart-page.css';

const CartPage = ({ onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const items = await cartService.getUserCart();
      setCartItems(items);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      toast.error('Erro ao carregar carrinho');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    const itemKey = `${item.order_id}-${item.product_id}`;
    
    // Marcar item como sendo atualizado
    setUpdatingItems(prev => new Set(prev).add(itemKey));

    // Atualização otimista - atualiza o estado local imediatamente
    const updatedItems = cartItems.map(cartItem => {
      if (cartItem.order_id === item.order_id && cartItem.product_id === item.product_id) {
        return {
          ...cartItem,
          quantity: newQuantity,
          item_value: cartItem.unity_value * newQuantity
        };
      }
      return cartItem;
    });
    setCartItems(updatedItems);

    try {
      await cartService.updateCartItemQuantity(
        item.order_id,
        item.product_id,
        newQuantity
      );
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast.error('Erro ao atualizar quantidade');
      // Reverter para o estado anterior em caso de erro
      await loadCartItems();
    } finally {
      // Remover item da lista de atualizando
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (item) => {
    const itemKey = `${item.order_id}-${item.product_id}`;
    
    // Marcar item como sendo atualizado
    setUpdatingItems(prev => new Set(prev).add(itemKey));

    // Atualização otimista - remove o item do estado local imediatamente
    const updatedItems = cartItems.filter(
      cartItem => !(cartItem.order_id === item.order_id && cartItem.product_id === item.product_id)
    );
    setCartItems(updatedItems);

    try {
      await cartService.removeFromCart(item.order_id, item.product_id);
      if (onCartUpdate) onCartUpdate();
      toast.success('Item removido do carrinho');
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
      // Reverter para o estado anterior em caso de erro
      await loadCartItems();
    } finally {
      // Remover item da lista de atualizando
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.item_value, 0);
  };

  const handleCheckout = () => {
    // Implementar checkout
    toast.info('Funcionalidade de checkout em desenvolvimento');
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-5">
        <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#dee2e6' }}></i>
        <h3 className="mt-3">Seu carrinho está vazio</h3>
        <p className="text-muted">Adicione alguns produtos para continuar</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/products')}
        >
          Ver Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-4">Meu Carrinho</h2>
        
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço Unitário</th>
                    <th>Quantidade</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const itemKey = `${item.order_id}-${item.product_id}`;
                    const isUpdating = updatingItems.has(itemKey);
                    
                    return (
                      <tr key={itemKey} style={{ opacity: isUpdating ? 0.6 : 1 }} data-updating={isUpdating}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.product_image_url || indisponivel3x2}
                              alt={item.product_title}
                              className="rounded me-3"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              onError={(e) => {
                                if (e.target.src !== indisponivel3x2) {
                                  e.target.src = indisponivel3x2;
                                }
                              }}
                            />
                            <div>
                              <h6 className="mb-0">{item.product_title}</h6>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.unity_value)}</td>
                        <td>
                          <div className="input-group" style={{ width: '120px' }}>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <input
                              type="text"
                              className={`form-control form-control-sm text-center ${isUpdating ? 'quantity-updating' : ''}`}
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              disabled={isUpdating}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </td>
                        <td className="fw-bold">{formatPrice(item.item_value)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-link text-danger"
                            onClick={() => handleRemoveItem(item)}
                            title="Remover item"
                            disabled={isUpdating}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Total:</td>
                    <td className="fw-bold fs-5 text-danger">{formatPrice(calculateTotal())}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-between">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/products')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Continuar Comprando
          </button>
          <button 
            className="btn btn-danger btn-lg"
            onClick={handleCheckout}
          >
            <i className="bi bi-check-circle me-2"></i>
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;