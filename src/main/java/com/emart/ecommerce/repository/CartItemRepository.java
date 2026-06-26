package com.emart.ecommerce.repository;

import com.emart.ecommerce.model.Cart;
import com.emart.ecommerce.model.CartItem;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface CartItemRepository extends JpaRepository<CartItem,Long> {
    @Query("""
        SELECT ci FROM CartItem ci WHERE ci.cart=:cart AND ci.product=:product AND ci.size=:size AND ci.userId=:userId
    """)
    CartItem cartItemExists(@Param("cart") Cart cart,
                        @Param("product") Product product,
                        @Param("size") Size size,
                        @Param("userId") Long userId);
}
