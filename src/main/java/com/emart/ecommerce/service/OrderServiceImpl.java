package com.emart.ecommerce.service;

import com.emart.ecommerce.exception.OrderException;
import com.emart.ecommerce.model.*;
import com.emart.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final Productrepository productRepository;

    @Override
    public Order createOrder(User user, Address address) {
        address.setUser(user);
        Address address1 = addressRepository.save(address);
        user.getAddresses().add(address1); // user address added for future reusability...
        userRepository.save(user);
        Cart cart = cartService.findUserCart(user.getId());
        List<OrderItems> orderItems = new ArrayList<>();
        for(CartItem cartItem : cart.getCartItems()){
            Product product = cartItem.getProduct();
            Size orderSize = cartItem.getSize();
            int orderedQty = cartItem.getQuantity();
            if(orderSize!=null){
                String sizeName = orderSize.getName();
                if (sizeName != null && !sizeName.isBlank()) {
                    boolean sizeFound = false;
                    for (Size size : product.getSizes()) {
                        if (size.getName().equalsIgnoreCase(sizeName)) {
                            sizeFound = true;
                            if (size.getQty() < orderedQty) {
                                throw new OrderException("Insufficient stock for product " + product.getTitle() + " in size " + sizeName + " (Available: " + size.getQty() + ", Requested: " + orderedQty + ")");
                            }
                            size.setQty(size.getQty() - orderedQty);
                            break;
                        }
                    }
                    if (!sizeFound) {
                        throw new OrderException("Size " + sizeName + " not found for product " + product.getTitle());
                    }
                }
            }
            // 2. Check and decrement overall product quantity
            if (product.getQuantity() < orderedQty) {
                throw new OrderException("Insufficient overall stock for product " + product.getTitle() + " (Available: " + product.getQuantity() + ", Requested: " + orderedQty + ")");
            }
            product.setQuantity(product.getQuantity() - orderedQty);
            // Save the updated product quantities
            productRepository.save(product);
            OrderItems orderItem1 = new OrderItems();
            orderItem1.setProduct(product);
            orderItem1.setPrice(cartItem.getPrice());
            orderItem1.setQuantity(cartItem.getQuantity());
            orderItem1.setSize(cartItem.getSize());
            orderItem1.setDiscountedPrice(cartItem.getDiscountedPrice());
            orderItem1.setUserId(cartItem.getUserId());
            OrderItems createdOrderItem = orderItemRepository.save(orderItem1);
            orderItems.add(createdOrderItem);
        }
        Order createdOrder = new Order();
        createdOrder.setOrderItems(orderItems);
        createdOrder.setUser(user);
        createdOrder.setTotalDiscountedPrice(cart.getTotalDiscountedPrice());
        createdOrder.setTotalPrice(cart.getTotalPrice());
        createdOrder.setDiscount(cart.getDiscount());
        createdOrder.setTotalItems(cart.getTotalItems());
        createdOrder.setAddress(address1);
        createdOrder.setStatus("PENDING");
        createdOrder.getPaymentdetails().setPaymentStatus("PENDING");
        createdOrder.setOrderDate(LocalDateTime.now());
        Order savedOrder = orderRepository.save(createdOrder);
        for(OrderItems item : orderItems){
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }
        return savedOrder;
    }
    @Override
    public Order findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(()->new OrderException("No Orders found"));
    }

    @Override
    public List<Order> userOrderHistory(Long userId)  {
        return orderRepository.getAllOrders(userId);
    }

    @Override
    public Order placedOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(
                        ()->new OrderException("No Orders found"));
        order.setStatus("PLACED");
        order.getPaymentdetails().setPaymentStatus("COMPLETED");
        return order;
    }

    @Override
    public Order confirmedOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(
                ()->new OrderException("No Orders found"));
        order.setStatus("CONFIRMED");
        return orderRepository.save(order);
    }

    @Override
    public Order shippedOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(
                ()->new OrderException("No Orders found"));
        order.setStatus("SHIPPED");
        return orderRepository.save(order);

    }

    @Override
    public Order deliveredOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(
                ()->new OrderException("No Orders found"));
        order.setStatus("DELIVERED");
        return orderRepository.save(order);

    }

//    @Override
//    public Order cancelledOrder(Long id) {
//        Order order = orderRepository.findById(id).orElseThrow(
//                ()->new OrderException("No Orders found"));
//        order.setStatus("CANCELLED");
//        return orderRepository.save(order);
//    }
@Override
public Order cancelledOrder(Long id) {
    Order order = orderRepository.findById(id).orElseThrow(
            ()->new OrderException("No Orders found"));
    // Prevent duplicate restoration if already cancelled
    if ("CANCELLED".equals(order.getStatus())) {
        return order;
    }
    // Restore product quantities
    for (OrderItems item : order.getOrderItems()) {
        Product product = item.getProduct();
        Size orderSize = item.getSize();
        int qty = item.getQuantity();

        if (orderSize != null) {
            String sizeName = orderSize.getName();
            if (sizeName != null && !sizeName.isBlank()) {
                for (Size size : product.getSizes()) {
                    if (size.getName().equalsIgnoreCase(sizeName)) {
                        size.setQty(size.getQty() + qty);
                        break;
                    }
                }
            }
        }

        // Restore overall product quantity
        product.setQuantity(product.getQuantity() + qty);
        productRepository.save(product);
    }

    order.setStatus("CANCELLED");
    return orderRepository.save(order);
}


    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new OrderException("No order found"));
        orderRepository.deleteById(id);
    }
}
