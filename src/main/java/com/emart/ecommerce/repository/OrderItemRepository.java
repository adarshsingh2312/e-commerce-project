package com.emart.ecommerce.repository;

import com.emart.ecommerce.model.OrderItems;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItems,Long> {
}
