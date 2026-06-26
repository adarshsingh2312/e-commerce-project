package com.emart.ecommerce.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.request.CreateProductRequest;

public interface ProductService {
    public Product createProduct(CreateProductRequest req);
    public String deleteProduct(Long id) throws ProductException;
    public Product updateProduct(Long id, Product product) throws ProductException;
    public Product findProductById(Long id) throws ProductException;
    public List<Product> findProductsByCategory(String category) throws ProductException;
    public Page<Product> getAllProducts (String category, List<String> colors, List<String> sizes, Integer minPrice, Integer maxPrice
            ,Integer minDiscount, String sort, String stock, Integer pageNumber, Integer pageSize);
    public List<Product> findAllProducts();
}
