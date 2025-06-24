// src/services/cartService.js
import supabase from './supabase';
import indisponivel3x2 from '@assets/img/indisponivel3x2.svg';

const cartService = {
  // Adicionar item ao carrinho
  async addToCart(productId, quantity = 1) {
    try {
      const { data, error } = await supabase.rpc('add_to_cart', {
        p_product_id: productId,
        p_quantity: quantity
      });

      if (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        throw error;
      }

      // A função retorna um JSONB com { success: boolean, message: string }
      if (!data.success) {
        throw new Error(data.message || 'Erro ao adicionar item ao carrinho');
      }

      return data;
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  },

  // Obter itens do carrinho do usuário atual
  async getUserCart() {
    try {
      const { data, error } = await supabase.rpc('get_user_cart');

      if (error) {
        console.error('Erro ao buscar carrinho:', error);
        throw error;
      }

      // Processar URLs das imagens (igual ao productService)
      for (let i = 0; i < data.length; i++) {
        if (data[i].product_image_url) {
          data[i].product_image_url = supabase.storage.from('products').getPublicUrl(data[i].product_image_url).data.publicUrl;
        } else {
          data[i].product_image_url = indisponivel3x2;
        }
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      throw error;
    }
  },

  // Obter quantidade total de itens no carrinho
  async getCartItemCount() {
    try {
      const cartItems = await this.getUserCart();
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Erro ao contar itens do carrinho:', error);
      return 0;
    }
  },

  // Remover item do carrinho
  async removeFromCart(orderId, productId) {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)
        .eq('product_id', productId);

      if (error) {
        console.error('Erro ao remover do carrinho:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      throw error;
    }
  },

  // Atualizar quantidade de um item no carrinho
  async updateCartItemQuantity(orderId, productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(orderId, productId);
      }

      const { error } = await supabase
        .from('order_items')
        .update({ quantity })
        .eq('order_id', orderId)
        .eq('product_id', productId);

      if (error) {
        console.error('Erro ao atualizar quantidade:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  },

  // Limpar carrinho (remover todos os itens)
  async clearCart(orderId) {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (error) {
        console.error('Erro ao limpar carrinho:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  }
};

export default cartService;