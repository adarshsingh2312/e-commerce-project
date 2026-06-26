package com.emart.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.emart.ecommerce.model.Product;
@Repository

public interface Productrepository extends JpaRepository<Product,Long>{
    @Query("""
    SELECT p FROM Product p
    WHERE (
        (:minPrice IS NULL AND :maxPrice IS NULL)
        OR p.discountedPrice BETWEEN :minPrice AND :maxPrice
    )
    AND (
        :minDiscount IS NULL
        OR p.discountedPercent >= :minDiscount
    )
    ORDER BY
        CASE WHEN :sort = 'price_high' THEN p.discountedPrice END DESC,
        CASE WHEN :sort = 'price_low' THEN p.discountedPrice END ASC
""")
    List<Product> filterProducts(
            @Param("category") String category,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("minDiscount") Integer minDiscount,
            @Param("sort") String sort
    );
}
