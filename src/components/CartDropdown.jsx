// src/components/CartDropdown.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '@services/cartService';
import { formatPrice } from '@assets/js/util';
import indisponivel3x2 from '@assets/img/indisponivel3x2.svg';

const CartDropdown = ({ isOpen, onClose, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen]);

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const items = await cartService.getUserCart();
      setCartItems(items);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.item_value, 0);
  };

  const handleRemoveItem = async (item) => {
    try {
      await cartService.removeFromCart(item.order_id, item.product_id);
      await loadCartItems();
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const handleCheckout = () => {
    // Por enquanto, apenas redireciona para a página de carrinho
    // Você pode implementar a página de checkout depois
    navigate('/cart');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="cart-dropdown position-absolute top-100 end-0 mt-2 bg-white rounded shadow-lg border"
      style={{
        width: '400px',
        maxHeight: '500px',
        zIndex: 1050,
        right: '0'
      }}
      onMouseLeave={onClose}
    >
      <div className="p-3 border-bottom">
        <h6 className="mb-0">Meu Carrinho</h6>
      </div>

      <div className="cart-items-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center p-4 text-muted">
            <i className="bi bi-cart-x fs-1"></i>
            <p className="mt-2">Seu carrinho está vazio</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={`${item.order_id}-${item.product_id}`} className="cart-item p-3 border-bottom">
              <div className="d-flex align-items-start">
                <img
                  src={item.product_image_url || indisponivel3x2}
                  alt={item.product_title}
                  className="rounded me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => {
                    if (e.target.src !== indisponivel3x2) {
                      e.target.src = indisponivel3x2;
                    }
                  }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1 small">{item.product_title}</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">
                        {item.quantity} x {formatPrice(item.unity_value)}
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="fw-bold me-2">{formatPrice(item.item_value)}</span>
                      <button
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => handleRemoveItem(item)}
                        title="Remover item"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <>
          <div className="p-3 border-top border-bottom bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold fs-5 text-danger">{formatPrice(calculateTotal())}</span>
            </div>
          </div>
          <div className="p-3">
            <button
              className="btn btn-danger w-100"
              onClick={handleCheckout}
            >
              <i className="bi bi-card-list me-2"></i>
              Ver Detalhes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDropdown;