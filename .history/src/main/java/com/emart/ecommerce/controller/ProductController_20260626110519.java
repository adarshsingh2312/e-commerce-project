package com.emart.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.service.ProductService;

@RestController
@RequestMapping("/api")
public class ProductController {
    @Autowired
    private ProductService productService;
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> findProductByCategoryHandler(
                                                                      @RequestParam(required = false, defaultValue = "") String gender,
                                                                      @RequestParam(required = false, defaultValue = "") String category,
                                                                      @RequestParam(required = false) List<String> colors,
                                                                      @RequestParam(required = false) List<String> sizes,
                                                                      @RequestParam(required = false, defaultValue = "0") Integer minPrice,
                                                                      @RequestParam(required = false, defaultValue = "1000000") Integer maxPrice,
                                                                      @RequestParam(required = false, defaultValue = "0") Integer minDiscount,
                                                                      @RequestParam(required = false, defaultValue = "12") Integer pageSize,
                                                                      @RequestParam(required = false, defaultValue = "0") Integer pageNumber,
                                                                      @RequestParam(required = false, defaultValue = "latest") String sort,
                                                                      @RequestParam(required = false, defaultValue = "in_stock") String stock){
        Page<Product> result = productService.getAllProducts(category, colors, sizes, minPrice, maxPrice, minDiscount, sort, stock, pageNumber, pageSize);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> findProductById(@PathVariable Long id) throws ProductException {
        return new ResponseEntity<>(productService.findProductById(id),HttpStatus.OK);
    }
}
