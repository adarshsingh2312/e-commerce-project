package com.emart.ecommerce.service;

import com.emart.ecommerce.model.OrderItems;
import com.emart.ecommerce.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderItemServiceImpl implements OrderItemService{
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Override
    public OrderItems createOrderItem(OrderItems orderItem) {
        return orderItemRepository.save(orderItem);
    }
}
