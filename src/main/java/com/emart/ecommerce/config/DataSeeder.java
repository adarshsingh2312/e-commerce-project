package com.emart.ecommerce.config;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.emart.ecommerce.model.Category;
import com.emart.ecommerce.model.Product;
import com.emart.ecommerce.model.Size;
import com.emart.ecommerce.repository.Categoryrepository;
import com.emart.ecommerce.repository.Productrepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final Productrepository productRepository;
    private final Categoryrepository categoryrepository;
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) {
            return;
        }
        ClassPathResource resource = new ClassPathResource("data/products_seed.json");
        try (InputStream inputStream = resource.getInputStream()) {
            ObjectMapper mapper = new ObjectMapper();
            SeedProductDto[] seedProducts = mapper.readValue(inputStream, SeedProductDto[].class);

            Map<String, Category> categoryCache = new HashMap<>();
            List<Product> products = new ArrayList<>();

            for (SeedProductDto dto : seedProducts) {
                Category topCategory = getCategory(dto.getTopLevelCategory(), 1, null, categoryCache);
                Category secondCategory = getCategory(dto.getSecondLevelCategory(), 2, topCategory, categoryCache);
                Category thirdCategory = getCategory(dto.getThirdLevelCategory(), 3, secondCategory, categoryCache);

                Product product = new Product();
                product.setTitle(dto.getTitle());
                product.setDescription(dto.getDescription());
                product.setPrice(dto.getPrice());
                product.setDiscountedPrice(dto.getDiscountedPrice());
                product.setDiscountedPercent(dto.getDiscountedPercent());
                product.setQuantity(dto.getQuantity());
                product.setBrand(dto.getBrand());
                product.setColour(dto.getColour());
                product.setImageUrl(dto.getImageUrl());
                product.setCategory(thirdCategory);
                product.setSizes(convertSizes(dto.getSizes()));
                products.add(product);
            }

            categoryrepository.saveAll(categoryCache.values());
            productRepository.saveAll(products);
            log.info("Seeded {} products across {} categories", products.size(), categoryCache.size());
        }
    }
    private Category getCategory(String name, int level, Category parent, Map<String, Category> cache) {
        String parentKey = parent == null ? "ROOT" : parent.getName();
        String cacheKey = level + ":" + parentKey + ":" + name;
        Category category = cache.get(cacheKey);
        if (category != null) {
            return category;
        }

        if (level == 1) {
            category = categoryrepository.findByNameAndLevelAndParentNull(name, level);
        } else {
            category = categoryrepository.findByNameAndParentCategory(name, parent.getName());
        }

        if (category == null) {
            category = new Category();
            category.setName(name);
            category.setLevel(level);
            category.setParentCategory(parent);
        }
        cache.put(cacheKey, category);
        return category;
    }
    private Set<Size> convertSizes(List<SeedSizeDto> sizes) {
        Set<Size> sizeSet = new HashSet<>();
        if (sizes == null) {
            return sizeSet;
        }
        for (SeedSizeDto dto : sizes) {
            sizeSet.add(new Size(dto.getName(), dto.getQuantity()));
        }
        return sizeSet;
    }

    @Data
    private static class SeedProductDto {
        private String title;
        private String description;
        private int price;
        private int discountedPrice;
        private int discountedPercent;
        private int quantity;
        private String brand;
        private String colour;
        private String imageUrl;
        private String topLevelCategory;
        private String secondLevelCategory;
        private String thirdLevelCategory;
        private List<SeedSizeDto> sizes;
    }
    @Data
    private static class SeedSizeDto {
        private String name;
        private int quantity;
    }
}