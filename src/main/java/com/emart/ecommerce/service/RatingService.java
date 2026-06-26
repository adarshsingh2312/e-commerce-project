package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.Rating;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.RatingRepository;
import com.emart.ecommerce.repository.UserRepository;
import com.emart.ecommerce.request.RatingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class RatingService {
    private final RatingRepository ratingRepository;
    private final ProductService productService;
    public Rating createRating(RatingRequest request, User user) throws ProductException {
        Product product = productService.findProductById(request.getProductId());
        Rating rating = new Rating();
        rating.setProduct(product);
        rating.setUser(user);
        rating.setRating(request.getRating());
        product.getRatings().add(rating);
        return ratingRepository.save(rating);
    }
    public List<Rating> getProductRatings(Long productId) throws ProductException { // Query wala method 3:15:50
        Product product = productService.findProductById(productId);
        return product.getRatings();
    }
}
