import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pagination from '@components/Pagination';
import productService from '@services/productService';
import { formatPrice } from '@assets/js/util.js';

const PRODUCTS_PER_PAGE = 8;

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const {
    data,
    isLoading: loadingProducts,
    isError,
    error,
  } = useQuery({
    queryKey: ['products', currentPage],
    queryFn: () => productService.getProductsByPage(currentPage, PRODUCTS_PER_PAGE),
    keepPreviousData: true,
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);
  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      toast.success('Produto excluído', { icon: '🗑️' });
      queryClient.invalidateQueries(['products']);
    },
    onError: (err) => toast.error(`Erro: ${err.message}`, { icon: '❌' }),
  });
  const handleDelete = (id) => {
    if (window.confirm('Excluir produto? Esta ação é irreversível.')) {
      deleteMutation.mutate(id);
    }
  };
  const handleEdit = (product) => {
    navigate(`/admin/products/edit/${product.id}`, { state: { product } });
  };
  if (isError) {
    return (
      <div className="alert alert-danger mt-4">
        Erro ao carregar produtos: {error.message}
      </div>
    );
  }
  return (
    <div className="row justify-content-center">
      <div className="col-12 mb-3">
        <div className="card">
          <div className="card-header text-bg-light d-flex justify-content-between align-items-center py-3">
            <h2 className="mb-0">Produtos</h2>
            <button
              className="btn btn-success"
              onClick={() => navigate('/admin/products/new')}>
              Adicionar Produto
            </button>
          </div>
          <div className="card-body p-0">
            {loadingProducts ? (
              <div className="text-center my-5">
                <div className="spinner-border" role="status"></div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="one-line-cell">Foto</th>
                      <th>Nome</th>
                      <th>Preço</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.products?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          Nenhum produto encontrado.
                        </td>
                      </tr>
                    )}
                    {data?.products && data.products.map((product) => (
                      <tr key={product.id}>                        <td className="one-line-cell px-3">
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="rounded"
                            style={{ width: 'auto', height: '60px', }}                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" fill="%23F8F9FA" stroke="%23D1D5DB"/%3E%3Ctext x="30" y="40" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="%236B7380"%3E?%3C/text%3E%3C/svg%3E';
                            }}/>
                        </td>
                        <td>{product.title}</td>
                        <td className="one-line-cell">{formatPrice(product.price)}</td>
                        <td className="text-center one-line-cell px-3">
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => handleEdit(product)}>
                            Alterar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(product.id)}>
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {data?.totalPages > 1 && (
        <>
          <div className="d-flex justify-content-center mb-2">
            <Pagination
              currentPage={currentPage}
              totalPages={data?.totalPages} />
          </div>
          <p className="small text-center m-0">
            Mostrando página {currentPage} de {data?.totalPages}
          </p>
        </>
      )}
    </div>
  );
};

export default AdminProductsPage;