package com. emart.ecommerce.request;

import java.util.HashSet;
import java.util.Set;

import com.emart.ecommerce.model.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class  CreateProductRequest {
    private String title;
    private String description;
    private String brand;
    private String color;
    private String imageUrl;
    private String category;
    private String topLevelCategory;
    private String secondLevelCategory;
    private String thirdLevelCategory;
    private Set<Size> sizes = new HashSet<>();
    private int price;
    private int discountedPrice;
    private int discountPercent;
    private int quantity;
}
