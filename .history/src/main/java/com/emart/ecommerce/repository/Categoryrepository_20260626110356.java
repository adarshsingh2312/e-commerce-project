package com.emart.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.emart.ecommerce.model.Category;

@Repository
public interface Categoryrepository extends JpaRepository<Category, Long> {
    
    Category findByName(String name);

    @Query("""
        SELECT c FROM Category c WHERE c.name =:name AND c.level = :level AND c.parentCategory IS NULL
    """)
    Category findByNameAndLevelAndParentNull(@Param("name") String name,
                                             @Param("level") int level);

    // THIS IS THE FIX: 
    // Just declare this method. Spring Data JPA sees "ParentCategory" and knows to match 
    // it against the parentCategory object field in your Category entity. No @Query needed!
    Category findByNameAndParentCategory(String name, Category parentCategory);
}