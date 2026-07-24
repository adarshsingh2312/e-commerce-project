package com.emart.ecommerce.service;

import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserServiceImplementation implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username);
        if(user==null)   throw new UsernameNotFoundException("User with email- "+ username+" not found");
        List<GrantedAuthority>authorities = new ArrayList<>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()));
        }
        return new org.springframework.security.core.userdetails.User(user.getEmail(),user.getPassword(),authorities);
    }
}
