package com.emart.ecommerce.controller;

import com.emart.ecommerce.model.Address;
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
    public ResponseEntity<User> getUserProfileHandler(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<Address> createUserAddressHandler(@PathVariable Long userId, @RequestBody Address address)
            throws Exception {
        Address address1 = userService.createUserAddress(userId, address);
        return new ResponseEntity<>(address1, HttpStatus.OK);
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<User> deleteUserAddressHandler(@RequestHeader("Authorization") String jwt,
            @PathVariable Long addressId) throws Exception {
        User user = userService.findUserByJwt(jwt);
        userService.deleteUserAddress(user.getId(), addressId);
        User updatedUser = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }
}
