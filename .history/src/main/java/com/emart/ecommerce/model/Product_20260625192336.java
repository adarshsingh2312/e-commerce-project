package com.emart.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;
    private String description;
    private int price;

    @Embedded
    @ElementCollection
    @Column(name = "sizes")
    private Set<Size> sizes = new HashSet<>();

    @Column(name = "discounted_price")
    private int discountedPrice;

    @Column(name = "discounted_percent")
    private int discountedPercent;
    private int quantity;
    private String brand;
    private String colour;
    private String gender;

    @Column(name = "product_category")
    private String productCategory;

    @Column(name = "sub_category")
    private String subCategory;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rating> ratings = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();
    @Column(name = "num_ratings")
    private int numRatings;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
