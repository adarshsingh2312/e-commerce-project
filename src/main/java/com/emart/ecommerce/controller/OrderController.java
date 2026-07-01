package com.emart.ecommerce.controller;

import com.emart.ecommerce.model.Address;
import com.emart.ecommerce.model.Order;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.service.OrderService;
import com.emart.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final UserService userService;
    private final OrderService orderService;
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestHeader("Authorization") String jwt, 
            @RequestBody Address address,
            @RequestHeader(value = "X-Payment-Method", required = false, defaultValue = "COD") String paymentMethod) {
        User user = userService.findUserByJwt(jwt);
        Order order = orderService.createOrder(user, address, paymentMethod);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<Order> findOrderById(Long id){
        Order order = orderService.findOrderById(id);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }
    @GetMapping("/user")
    public ResponseEntity<List<Order>> userOrderHistory(@RequestHeader("Authorization") String jwt){
        User user = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(orderService.userOrderHistory(user.getId()),HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Order> findOrderById(@PathVariable Long id,
                                               @RequestHeader("Authorization")String jwt){
        User user = userService.findUserByJwt(jwt);
        Order order = orderService.findOrderById(id);
        return new ResponseEntity<>(order,HttpStatus.ACCEPTED);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id,
                                             @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwt(jwt);
        Order order = orderService.findOrderById(id);
        if (!order.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if ("DELIVERED".equalsIgnoreCase(order.getStatus())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Order cancelled = orderService.cancelledOrder(id);
        return new ResponseEntity<>(cancelled, HttpStatus.OK);
    }
}
