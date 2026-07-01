package com.emart.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.emart.ecommerce.repository.OrderRepository;
import com.emart.ecommerce.model.Order;

@SpringBootTest
class ECommerceApplicationTests {
    @Autowired
    private OrderRepository orderRepository;

    @Test
    void contextLoads() {
        for (Order order : orderRepository.findAll()) {
            System.out.println("DEBUG_ORDER: id=" + order.getId() + " status=" + order.getStatus() + " user=" + (order.getUser() != null ? order.getUser().getEmail() : "NULL"));
        }
    }
}
