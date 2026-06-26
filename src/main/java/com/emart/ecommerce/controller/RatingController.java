package com.emart.ecommerce.controller;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.exception.UserException;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.Rating;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.request.RatingRequest;
import com.emart.ecommerce.service.RatingService;
import com.emart.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {
    private final RatingService ratingService;
    private final UserService userService;
    @PostMapping("/create")
    public ResponseEntity<Rating>createRating(@RequestBody RatingRequest request,
                                              @RequestHeader("Authorization")String jwt) throws UserException, ProductException {
        User user = userService.findUserByJwt(jwt);
        Rating rating = ratingService.createRating(request,user);
        return new ResponseEntity<>(rating, HttpStatus.CREATED);
    }
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>>getProductRatings(@PathVariable Long productId,
                                                    @RequestHeader("Authorization")String jwt) throws UserException, ProductException {
        User user = userService.findUserByJwt(jwt);
        List<Rating> ratings = ratingService.getProductRatings(productId);
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }
}
