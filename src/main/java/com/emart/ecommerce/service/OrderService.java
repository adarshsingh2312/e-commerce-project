package com.emart.ecommerce.service;

import com.emart.ecommerce.model.Address;
import com.emart.ecommerce.model.Order;
import com.emart.ecommerce.model.User;

import java.util.List;

public interface OrderService {
    public Order createOrder(User user, Address address, String paymentMethod);
    public Order findOrderById(Long id);
    public List<Order> userOrderHistory(Long userId);
    public Order placedOrder(Long id);
    public Order confirmedOrder(Long id);
    public Order shippedOrder(Long id);
    public Order deliveredOrder(Long id);
    public Order cancelledOrder(Long id);
    public List<Order>getAllOrders();
    public void deleteOrder(Long id);
}
