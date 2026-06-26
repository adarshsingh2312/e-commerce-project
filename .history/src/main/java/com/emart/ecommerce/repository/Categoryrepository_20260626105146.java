package com.emart.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.emart.ecommerce.model.Category;

@Repository
public interface Categoryrepository extends JpaRepository<Category,Long> {
    Category findByName(String topLevelCategory);

    @Query("""
        SELECT c FROM Category c WHERE c.name =:name AND c.level = :level AND c.parentCategory IS NULL
    """)
    Category findByNameAndLevelAndParentNull(@Param("name") String name,
                                             @Param("level") int level);

    @Query("""
        SELECT c FROM Category c WHERE c.name =:name AND c.parentCategory.name =:parentCategoryName
    """)
    Category findByNameAndParent(@Param("name") String name,
                                 @Param("parentCategoryName") String parentName);
}
