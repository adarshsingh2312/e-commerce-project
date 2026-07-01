package com.emart.ecommerce.service;

import com.emart.ecommerce.config.JwtProvider;
import com.emart.ecommerce.request.UserRequest;
import com.emart.ecommerce.exception.UserException;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.AddressRepository;
import com.emart.ecommerce.repository.UserRepository;
import com.emart.ecommerce.request.LoginRequest;
import com.emart.ecommerce.response.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.emart.ecommerce.model.Address;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtProvider jwtProvider;
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private CustomUserServiceImplementation customUserServiceImplementation;

    public AuthResponse CreateUser(UserRequest user, CartService cartService) {
        String email = user.getEmail();
        String password = user.getPassword();
        if (userRepository.findByEmail(email) != null) {
            throw new UserException("Email is already in use with other account");
        }
        password = passwordEncoder.encode(password);
        user.setPassword(password);
        User savedUser = userRepository.save(mapToUser(user));
        cartService.createCart(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtProvider.generateToken(authentication);
        return new AuthResponse(token, "Signup Successful!");
    }

    public User findUserById(Long id) throws UserException {
        return userRepository.findById(id).orElseThrow(
                () -> new UserException("User not found!"));
    }

    public User findUserByJwt(String jwt) throws UserException {
        String email = jwtProvider.getEmailFromToken(jwt);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("User not found with " + email + " email-id..");
        }
        return user;
    }

    public User mapToUser(UserRequest userRequest) {
        User user = new User();
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());
        user.setMobileNumber(userRequest.getMobileNumber());
        user.setRole(userRequest.getRole());
        return user;
    }

    public AuthResponse loginUserhandler(LoginRequest loginRequest) {
        String username = loginRequest.getEmail();
        String password = loginRequest.getPassword();
        Authentication authentication = authenticate(username, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtProvider.generateToken(authentication);
        return new AuthResponse(token, "Login successful!");
    }

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserServiceImplementation.loadUserByUsername(username);
        if (userDetails == null) {
            throw new BadCredentialsException("Invalid Username");
        }
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid Password");
        }
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    public Address createUserAddress(Long userId, Address address) throws UserException {
        User user = findUserById(userId);
        address.setUser(user);
        address.setFirstName(user.getFirstName());
        address.setLastName(user.getLastName());
        address.setMobileNumber(user.getMobileNumber());
        return addressRepository.save(address);
    }

    public void deleteUserAddress(Long userId, Long addressId) throws UserException {
        Address address = addressRepository.findById(addressId).orElse(null);
        if (address != null && address.getUser().getId().equals(userId)) {
            address.setUser(null);
            addressRepository.save(address);
        }
    }

}