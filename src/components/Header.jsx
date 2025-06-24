import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import authService from '@services/authService';
import profileService from '@services/profileService';
import CartDropdown from '@components/CartDropdown';
import avatar40 from '@assets/img/avatar40x40.svg';

const Header = ({ cartCount = 0, onCartUpdate }) => {
  const { user, isAdmin } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(avatar40);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cartHoverTimeout, setCartHoverTimeout] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          setAvatarUrl(avatar40);
          const profile = await profileService.getProfile();
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
        }
      };
      fetchProfile();
    } else {
      setAvatarUrl(avatar40);
    }
  }, [user]);

  const handleCartMouseEnter = () => {
    // Limpar timeout anterior se existir
    if (cartHoverTimeout) {
      clearTimeout(cartHoverTimeout);
      setCartHoverTimeout(null);
    }
    // Mostrar dropdown apenas se usuário estiver logado
    if (user) {
      setShowCartDropdown(true);
    }
  };

  const handleCartMouseLeave = () => {
    // Adicionar um pequeno delay antes de fechar para melhorar UX
    const timeout = setTimeout(() => {
      setShowCartDropdown(false);
    }, 300);
    setCartHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    // Cancelar fechamento se mouse entrar no dropdown
    if (cartHoverTimeout) {
      clearTimeout(cartHoverTimeout);
      setCartHoverTimeout(null);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <NavLink className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi-shop me-2 fs-3"></i>
            Loja Virtual
          </NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menuPrincipal">
            <div className="navbar-nav">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
              <NavLink className="nav-link" to="/products" end>
                Produtos
              </NavLink>
              <a className="nav-link" href="/about">Quem Somos</a>
              <a className="nav-link" href="/contact">Contato</a>
            </div>
            <div className="d-flex gap-3 ms-auto text-end align-items-center">
              <div 
                className="position-relative"
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleCartMouseLeave}
              >
                <span className="navbar-text position-relative" style={{ cursor: 'pointer' }}>
                  <i className="bi-cart fs-3"></i>
                  {cartCount > 0 && (
                    <span className="badge bg-danger rounded-pill position-absolute top-0 start-50">
                      {cartCount}
                    </span>
                  )}
                </span>
                {user && (
                  <div onMouseEnter={handleDropdownMouseEnter}>
                    <CartDropdown 
                      isOpen={showCartDropdown}
                      onClose={() => setShowCartDropdown(false)}
                      onCartUpdate={onCartUpdate}
                    />
                  </div>
                )}
              </div>
              {user ? (
                <div className="dropdown text-end d-flex align-items-center">
                  <a className="text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="rounded-circle me-2 border border-1 border-secondary border-opacity-75 p-1"
                      style={{ width: 32, height: 32, objectFit: 'cover' }}
                    />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {isAdmin && (
                      <>
                        <li><Link className="dropdown-item" to="/admin/users">Usuários</Link></li>
                        <li><Link className="dropdown-item" to="/admin/categories">Categorias</Link></li>
                        <li><Link className="dropdown-item" to="/admin/products">Produtos</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    <li><Link className="dropdown-item" to="/user/profile">Perfil</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button onClick={() => authService.logout()} className="dropdown-item">Sair</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline-light ms-3">Entrar</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header;