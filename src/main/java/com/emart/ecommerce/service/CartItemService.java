package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.CartItemException;
import com.emart.ecommerce.exception.UserException;
import com.emart.ecommerce.model.Cart;
import com.emart.ecommerce.model.CartItem;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.Size;

public interface CartItemService {
    public CartItem createCartItem(CartItem item);

    public CartItem updateCartItem(Long userId, Long id, CartItem item) throws CartItemException, UserException;

    public CartItem cartItemExist(Cart cart, Product product, Size size, Long user_id);

    public void removeCartItem(Long userId, Long cartItemId);
    public CartItem findCartItemById(Long id);
}
