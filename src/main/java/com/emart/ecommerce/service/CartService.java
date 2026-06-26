package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Cart;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.request.AddItemRequest;
import lombok.Setter;
import org.springframework.stereotype.Service;

public interface CartService {
    public Cart createCart(User user);
    public String addCartItem(Long userId, AddItemRequest request) throws ProductException;
    public Cart findUserCart(Long userId);
}
