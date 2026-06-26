package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.ProductException;
import com.emart.ecommerce.model.Category;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.repository.Categoryrepository;
import com.emart.ecommerce.repository.Productrepository;
import com.emart.ecommerce.request.CreateProductRequest;
import com.emart.ecommerce.util.ProductCategoryMapper;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
//import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService{
    private final Productrepository productrepository;
    private final Categoryrepository categoryrepository;
    private final UserService userService;
    @Override
    public Product createProduct(CreateProductRequest req) {
        Category topLevel = categoryrepository.findByName(req.getTopLevelCategory());
        if(topLevel==null){
            Category topLevelCategory = new Category();
            topLevelCategory.setName(req.getTopLevelCategory());
            topLevelCategory.setLevel(1);
            topLevel = categoryrepository.save(topLevelCategory);
        }
        Category secondLevel = categoryrepository.findByNameAndParent(req.getSecondLevelCategory(),
                topLevel.getName());
        if(secondLevel==null){
            Category secondLevelCategory = new Category();
            secondLevelCategory.setName(req.getSecondLevelCategory());
            secondLevelCategory.setLevel(2);
            secondLevelCategory.setParentCategory(topLevel);
            secondLevel = categoryrepository.save(secondLevelCategory);
        }
        Category thirdLevel = categoryrepository.findByNameAndParent(req.getThirdLevelCategory(),
                secondLevel.getName());
        if(thirdLevel==null) {
            Category thirdLevelCategory = new Category();
            thirdLevelCategory.setName(req.getThirdLevelCategory());
            thirdLevelCategory.setLevel(3 );
            thirdLevelCategory.setParentCategory(secondLevel);
            thirdLevel = categoryrepository.save(thirdLevelCategory);
        }
        Product product = getProduct(req, thirdLevel);
        return productrepository.save(product);
    }

    private static Product getProduct(CreateProductRequest req, Category thirdLevel) {
        Product product = new Product();
        product.setTitle(req.getTitle());
        product.setDescription(req.getDescription());
        product.setBrand(req.getBrand());
        product.setColour(req.getColor());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(thirdLevel);
        product.setSizes(req.getSizes());
        product.setPrice(req.getPrice());
        product.setDiscountedPrice(req.getDiscountedPrice());
        product.setDiscountedPercent(req.getDiscountPercent());
        product.setQuantity(req.getQuantity());
        return product;
    }

    @Override
    public String deleteProduct(Long id) throws ProductException {
        Product product = findProductById(id);
        if(product==null){
            throw new ProductException("Product doesn't exist with given id");
        }
        product.getSizes().clear();
        productrepository.delete(product);
        return "Product deleted successfully ";
    }

    @Override
    public Product updateProduct(Long id, Product req) throws ProductException {
        Product product = findProductById(id);
        if(req.getQuantity()!=0){
            product.setQuantity(req.getQuantity());
        }
        productrepository.save(product);
        return product;
    }

    @Override
    public Product findProductById(Long id) throws ProductException {
        return productrepository.findById(id).orElseThrow(()->
                new ProductException("Product not found with id : "+ id));
    }

    @Override
    public List<Product> findProductsByCategory(String category) throws ProductException {
        return List.of();
    }

    @Override // most important method..
    public Page<Product> getAllProducts(String category, List<String> colors, List<String> sizes,
                                        Integer minPrice, Integer maxPrice, Integer minDiscount, String sort, String stock, Integer pageNumber, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        if(colors != null && !colors.isEmpty()){
             products = products.stream()
                     .filter(p->colors.stream().
                             anyMatch(c->c.equalsIgnoreCase(p.getColour())))
                     .toList();
        }
        if(stock == null || stock.isBlank()) {
            stock = "in_stock";
        }
        if(stock.equalsIgnoreCase("in_stock")) {
            products = products.stream()
                    .filter(p -> p.getQuantity() > 0)
                    .toList();
        }
        else if(stock.equalsIgnoreCase("out_of_stock")) {
            products = products.stream()
                    .filter(p -> p.getQuantity() == 0)
                    .toList();
        }
        int startIndex = (int)pageable.getOffset();
        int endIndex = Math.min(startIndex+pageable.getPageSize(),products.size());
        if(startIndex >= products.size()) {
            return new PageImpl<>(List.of(), pageable, products.size());
        }
        List<Product> pageContent = products.subList(startIndex,endIndex);
        return new PageImpl<>(pageContent,pageable,products.size());
    }

    @Override
    public List<Product> findAllProducts() {
        return productrepository.findAll();
    }
}
