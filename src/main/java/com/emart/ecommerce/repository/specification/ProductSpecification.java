package com.emart.ecommerce.repository.specification;

import com.emart.ecommerce.model.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {
    public static Specification<Product> hasCategory(String category){
        return ((root, query, criteriaBuilder) -> {
            if(category==null || category.isEmpty()){
                return null;
            }
            return criteriaBuilder.equal(root.get("category").get("name"),category);
        });
    }
    public static Specification<Product> hasMinPrice(Integer minPrice){
        return ((root, query, criteriaBuilder) -> {
            if(minPrice==null){
                return null;
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("price"),minPrice);
        });
    }
    public static Specification<Product> hasMaxPrice(Integer maxPrice){
        return ((root, query, criteriaBuilder) -> {
            if(maxPrice==null){
                return null;
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("price"),maxPrice);
        });
    }

}
