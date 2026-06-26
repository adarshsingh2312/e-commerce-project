package com.emart.ecommerce.controller;

import com.emart.ecommerce.model.User;
import com.emart.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfileHandler(@RequestHeader("Authorization") String jwt){
        User user = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }
}
