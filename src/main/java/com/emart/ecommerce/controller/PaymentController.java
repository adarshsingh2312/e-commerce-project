package com.emart.ecommerce.controller;

import com.emart.ecommerce.exception.OrderException;
import com.emart.ecommerce.model.Order;
import com.emart.ecommerce.model.PaymentDetails;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.OrderRepository;
import com.emart.ecommerce.request.PaymentRequest;
import com.emart.ecommerce.service.OrderService;
import com.emart.ecommerce.service.UserService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final UserService userService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @PostMapping("/create-order/{order_id}")
    public ResponseEntity<PaymentDetails> createOrder(@RequestHeader("Authorization") String jwt,
                                                      @PathVariable Long order_id) throws RazorpayException {
        Order order = orderService.findOrderById(order_id);
        User user = userService.findUserByJwt(jwt);
        if (!order.getUser().getId().equals(user.getId())){
            throw new OrderException("You are not allowed to access this order");
        }
        long totalAmount = order.getTotalDiscountedPrice() * 100L; // paise
        try{
            RazorpayClient razorpayClient = new RazorpayClient("rzp_test_T75cz57uStNvTk","XAT1q8JLGDjv3CZxU7ngqhg0");
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount",totalAmount);
            orderRequest.put("currency","INR");
            orderRequest.put("receipt","order_receipt: " + order_id);
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");
            order.getPaymentdetails().setPaymentStatus("PENDING");
            order.getPaymentdetails().setPaymentMethod("Razorpay");
            order.getPaymentdetails().setRazorpayPaymentLinkId(razorpayOrderId);
            orderRepository.save(order);
            return new ResponseEntity<>(order.getPaymentdetails(), HttpStatus.OK);
        } catch (RazorpayException e) {
            throw e;
        }
    }
    @PostMapping("/verify")
    public ResponseEntity<PaymentDetails> verifyPayment(@RequestBody PaymentRequest request) throws RazorpayException {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpay_order_id());
            attributes.put("razorpay_payment_id", request.getRazorpay_payment_id());
            attributes.put("razorpay_signature", request.getRazorpay_signature());

            boolean isValid = com.razorpay.Utils.verifyPaymentSignature(attributes, "XAT1q8JLGDjv3CZxU7ngqhg0");
            if (isValid) {
                Order order = orderRepository.findByRazorpayOrderId(request.getRazorpay_order_id());
                if (order == null) {
                    throw new OrderException("Order not found with Razorpay ID: " + request.getRazorpay_order_id());
                }

                order.getPaymentdetails().setPaymentStatus("COMPLETED");
                order.getPaymentdetails().setPaymentId(request.getRazorpay_payment_id());
                order.getPaymentdetails().setRazorpayPaymentId(request.getRazorpay_payment_id());
                order.setStatus("PENDING");

                orderRepository.save(order);
                return new ResponseEntity<>(order.getPaymentdetails(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }
        catch (RazorpayException e) {
            throw e;
        }
    }
}
