package com.emart.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @OneToMany(mappedBy = "cart",cascade = CascadeType.ALL)
    @Column(name = "cart_items")
    private Set<CartItem> cartItems = new HashSet<>();
    @Column(name = "total_price")
    private double totalPrice;
    private int totalDiscountedPrice;
    @Column(name = "total_items")
    private int totalItems;
    private int discount;

}
