package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.Review;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.Productrepository;
import com.emart.ecommerce.repository.ReviewRepository;
import com.emart.ecommerce.request.ReviewRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository ReviewRepository;
    private final ProductService productService;
    private final Productrepository productrepository;
    public Review createReview(ReviewRequest request, User user) throws ProductException {
        Product product = productService.findProductById(request.getProductId());
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setReview(request.getReview());
        product.getReviews().add(review);
        productrepository.save(product);
        return ReviewRepository.save(review);
    }
    public List<Review> getProductReviews(Long productId) throws ProductException {
        Product product = productService.findProductById(productId);
        return product.getReviews();
    }
}
