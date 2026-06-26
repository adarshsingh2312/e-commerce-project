package com.emart.ecommerce.repository;

import com.emart.ecommerce.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatingRepository extends JpaRepository<Rating,Long> {
}
