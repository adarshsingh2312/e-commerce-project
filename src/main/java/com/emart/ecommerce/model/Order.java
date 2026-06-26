package com.emart.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String orderId;
    @ManyToOne
    private User user;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItems> orderItems = new ArrayList<>();
    private LocalDateTime orderDate;
    private LocalDate deliveryDate;
    @OneToOne
    private Address address;
    @Embedded
    private PaymentDetails paymentdetails = new PaymentDetails();
    private double totalPrice;
    private Integer totalDiscountedPrice;
    private Integer discount;
    private Integer totalItems;
    private String status;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
