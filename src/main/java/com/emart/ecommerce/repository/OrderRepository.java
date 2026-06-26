package com.emart.ecommerce.repository;

import com.emart.ecommerce.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {
    @Query("""
    Select o From Order o where o.user.id=:userId And (o.status ="PLACED" or o.status="CONFIRMED" or o.status="SHIPPED" or o.status="DELIVERED" or o.status="PENDING")
""")
    public List<Order> getAllOrders(@Param("userId") Long userId);
}
