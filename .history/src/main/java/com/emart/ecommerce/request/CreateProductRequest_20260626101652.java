package com. emart.ecommerce.request;

import com.emart.ecommerce.model.Category;
import com.emart.ecommerce.model.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class  CreateProductRequest {
    private String title;
    private String description;
    private String brand;
    private String color;
    private String imageUrl;
    private String gender;
    private String category;
    private String subCategory;
    private String topLevelCategory;
    private String secondLevelCategory;
    private String thirdLevelCategory;
    private Set<Size> sizes = new HashSet<>();
    private int price;
    private int discountedPrice;
    private int discountPercent;
    private int quantity;

}
