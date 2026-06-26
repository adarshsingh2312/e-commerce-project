package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Cart;
import com.emart.ecommerce.model.CartItem;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.CartRepository;
import com.emart.ecommerce.request.AddItemRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService{
    private final CartRepository cartRepository;
    private final CartItemService cartItemService;
    private final ProductService productService;
    @Override
    public Cart createCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    @Override
    public String addCartItem(Long userId, AddItemRequest request) throws ProductException {
        Cart cart = cartRepository.findByUserId(userId);
        Product product = productService.findProductById(request.getProductId());
        CartItem isPresent =  cartItemService.cartItemExist(cart,product,request.getSize(),userId);
        if(isPresent==null){
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setUserId(userId);
            int price = request.getQuantity()* product.getDiscountedPrice();
            cartItem.setPrice(price);
            cartItem.setSize(request.getSize());
            cart.getCartItems().add(cartItemService.createCartItem(cartItem));
        }
        return "Item added to cart successfully";
    }

    @Override
    public Cart findUserCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);
        int totalPrice = 0;
        int totalDiscountedPrice = 0;
        int totalItems = 0;
        for(CartItem cartItem : cart.getCartItems()){
            totalPrice+=cartItem.getPrice();
            totalItems+=cartItem.getQuantity();
            totalDiscountedPrice += cartItem.getDiscountedPrice();
        }
        cart.setTotalItems(totalItems);
        cart.setTotalDiscountedPrice(totalDiscountedPrice);
        cart.setTotalPrice(totalPrice);
        cart.setDiscount(totalPrice-totalDiscountedPrice);
        return cartRepository.save(cart);
    }
}
