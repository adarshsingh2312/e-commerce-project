package com.emart.ecommerce.controller;

import com.emart.ecommerce.model.Order;
import com.emart.ecommerce.response.ApiResponse;
import com.emart.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    @Autowired
    private OrderService orderService;
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrdersHandler(){
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
    @PutMapping("/{orderId}/shipped")
    public ResponseEntity<Order> shippedOrderHandler(@PathVariable Long orderId,
                                                     @RequestHeader("Authorization") String jwt ){
        Order order = orderService.shippedOrder(orderId);
        return new ResponseEntity<>(order,HttpStatus.OK);
    }
    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<Order> confirmedOrderHandler(@PathVariable Long orderId,
                                                     @RequestHeader("Authorization") String jwt ){
        Order order = orderService.confirmedOrder(orderId);
        return new ResponseEntity<>(order,HttpStatus.OK);
    }
    @PutMapping("/{orderId}/deliver")
    public ResponseEntity<Order> deliveredOrderHandler(@PathVariable Long orderId,
                                                       @RequestHeader("Authorization") String jwt ){
        Order order = orderService.deliveredOrder(orderId);
        return new ResponseEntity<>(order,HttpStatus.OK);
    }
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelledOrderHandler(@PathVariable Long orderId,
                                                       @RequestHeader("Authorization") String jwt ){
        Order order = orderService.cancelledOrder(orderId);
        return new ResponseEntity<>(order,HttpStatus.OK);
    }

    @DeleteMapping("/{orderId}/delete")
    public ResponseEntity<ApiResponse > deleteOrderHandler(@PathVariable Long orderId,
                                                    @RequestHeader("Authorization") String jwt) {
        orderService.deleteOrder(orderId);
        ApiResponse response = new ApiResponse();
        response.setMessage("Order deleted successfully!");
        response.setStatus(true);
        return new ResponseEntity<>(response,HttpStatus.OK);
    }
}
