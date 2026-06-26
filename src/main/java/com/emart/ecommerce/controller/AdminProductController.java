package com.emart.ecommerce.controller;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.request.CreateProductRequest;
import com.emart.ecommerce.response.ApiResponse;
import com.emart.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {
    @Autowired
    private ProductService productService;
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody CreateProductRequest request){
        Product product = productService.createProduct(request);
        return new ResponseEntity<>(product, HttpStatus.CREATED);
    }
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long productId) throws ProductException {
        productService.deleteProduct(productId);
        ApiResponse response = new ApiResponse();
        response.setMessage("Product deleted successfully..");
        response.setStatus(true);
        return new ResponseEntity<>(response,HttpStatus.OK);
    }
    @GetMapping("/all")
    public ResponseEntity<List<Product>> findAllProducts(){
        List<Product> products = productService.findAllProducts();
        return new ResponseEntity<>(products,HttpStatus.OK);
    }
    @PutMapping("/{productId}/update")
    public ResponseEntity<Product> updateProduct(@PathVariable Long productId, @RequestBody Product product) throws ProductException {
        Product product1 = productService.updateProduct(productId,product);
        return new ResponseEntity<>(product1,HttpStatus.OK);
    }
    @PostMapping("/creates")
    public ResponseEntity<ApiResponse> createMultipleProducts(@RequestBody List<CreateProductRequest> req){
        for(CreateProductRequest request : req){
            productService.createProduct(request);
        }
        ApiResponse response = new ApiResponse("Products created successfully",true);
        return new ResponseEntity<>(response,HttpStatus.CREATED);
    }
}
