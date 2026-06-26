package com.emart.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class OrderItems {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne
    @JsonIgnore
    private Order order;
    @ManyToOne
    private Product product;
    private Size size;
    private int quantity;
    private Long userId;
    private int discountedPrice;
    private LocalDateTime deliveryDate;
    private int price;
}
