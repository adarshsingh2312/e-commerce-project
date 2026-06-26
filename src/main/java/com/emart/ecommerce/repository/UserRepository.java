package com.emart.ecommerce.repository;

import com.emart.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface UserRepository extends JpaRepository<User,Long> {
    public User findByEmail(String email);
}
