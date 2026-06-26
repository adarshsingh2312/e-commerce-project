package com.emart.ecommerce.controller;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Cart;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.request.AddItemRequest;
import com.emart.ecommerce.response.ApiResponse;
import com.emart.ecommerce.service.CartItemService;
import com.emart.ecommerce.service.CartService;
import com.emart.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/cart")
@RestController
public class CartController {
    @Autowired
    private CartService cartService;
    @Autowired
    private UserService userService;
    @Autowired
    private CartItemService cartItemService;
    @GetMapping
    public ResponseEntity<Cart> findUserCartHandler(@RequestHeader("Authorization") String jwt){
        User user = userService.findUserByJwt(jwt);
        Cart cart = cartService.findUserCart(user.getId());
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }
    @PutMapping("/add")
    public ResponseEntity<ApiResponse> addItemToCart(@RequestBody AddItemRequest request,
                                                     @RequestHeader("Authorization") String jwt) throws ProductException {
        User user = userService.findUserByJwt(jwt);
        cartService.addCartItem(user.getId(),request);
        ApiResponse response = new ApiResponse("Items added successfully",true);
        return new ResponseEntity<>(response,HttpStatus.OK);
    }
    @DeleteMapping("/delete/{itemId}")
    public ResponseEntity<ApiResponse> deleteItem(@RequestHeader("Authorization") String jwt,
                                                  @PathVariable Long itemId){
        User user = userService.findUserByJwt(jwt);
        cartItemService.removeCartItem(user.getId(), itemId);
        ApiResponse response = new ApiResponse("Item removed from cart successfully!",true);
        return new ResponseEntity<>(response,HttpStatus.OK);
    }
}
