package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.CartItemException;
import com.emart.ecommerce.exception.UserException;
import com.emart.ecommerce.model.*;
import com.emart.ecommerce.repository.CartItemRepository;
import com.emart.ecommerce.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartItemServiceImpl implements CartItemService{
    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final CartRepository cartRepository;
    @Override
    public CartItem createCartItem(CartItem item) {
        item.setQuantity(item.getQuantity()+1);
        item.setPrice(item.getProduct().getPrice()*item.getQuantity());
        item.setDiscountedPrice(item.getProduct().getDiscountedPrice() * item.getQuantity());
        return cartItemRepository.save(item);
    }

    @Override
    public CartItem updateCartItem(Long userId, Long id, CartItem item) throws CartItemException, UserException {
        CartItem item1 = findCartItemById(id);
        User user = userService.findUserById(id);
        if(user.getId().equals(userId)){
            item1.setQuantity(item.getQuantity());
            item1.setPrice(item1.getProduct().getPrice()*item1.getQuantity());
            item1.setDiscountedPrice(item1.getProduct().getDiscountedPrice()*item1.getQuantity());
            return cartItemRepository.save(item1);
        }
        else{
            throw new CartItemException("User is not allowed to access following cart items");
        }
    }

    @Override
    public CartItem cartItemExist(Cart cart, Product product, Size size, Long user_id) {
        return cartItemRepository.cartItemExists(cart,product,size,user_id);
    }

    @Override
    public void removeCartItem(Long userId, Long cartItemId) {
        CartItem item = findCartItemById(cartItemId);
        User user = userService.findUserById(item.getUserId());
        User reqUser = userService.findUserById(userId);
        if(user.getId().equals(reqUser.getId())){
            cartItemRepository.deleteById(cartItemId);
        }
        else{
            throw new UserException("You can not remove other user's items");
        }
    }

    @Override
    public CartItem findCartItemById(Long id) {
       return cartItemRepository.findById(id).orElseThrow(()->
                new CartItemException("Item not found with given id"));
    }
}
