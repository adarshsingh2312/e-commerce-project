package com.emart.ecommerce.controller;

import com.emart.ecommerce.model.Cart;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.request.UserRequest;

import com.emart.ecommerce.request.LoginRequest;
import com.emart.ecommerce.response.AuthResponse;
import com.emart.ecommerce.service.CartService;
import com.emart.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private CartService cartService;
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUser(@RequestBody UserRequest user){
        AuthResponse response = userService.CreateUser(user,cartService);
        return new ResponseEntity<>(response,HttpStatus.CREATED);
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUserHandler(@RequestBody LoginRequest loginRequest){
        AuthResponse response = userService.loginUserhandler(loginRequest);
        return new ResponseEntity<>(response,HttpStatus.CREATED);
    }
}