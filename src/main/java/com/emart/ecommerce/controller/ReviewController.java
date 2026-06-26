package com.emart.ecommerce.controller;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.exception.UserException;
import com.emart.ecommerce.model.Review;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.request.ReviewRequest;
import com.emart.ecommerce.service.ReviewService;
import com.emart.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final UserService userService;
    @PostMapping("/create")
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request,
                                               @RequestHeader("Authorization")String jwt) throws UserException, ProductException {
        User user = userService.findUserByJwt(jwt);
        Review review = reviewService.createReview(request,user);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>>getProductReviews(@PathVariable Long productId,
                                                         @RequestHeader("Authorization")String jwt) throws UserException, ProductException {
        User user = userService.findUserByJwt(jwt);
        List<Review> reviews = reviewService.getProductReviews(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }
}
