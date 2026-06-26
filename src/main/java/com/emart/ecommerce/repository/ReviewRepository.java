package com.emart.ecommerce.repository;

import com.emart.ecommerce.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review,Long> {
}
