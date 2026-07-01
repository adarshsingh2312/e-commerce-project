package com.emart.ecommerce.controller;

import com.emart.ecommerce.model.Order;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.service.OrderService;
import com.emart.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @GetMapping("/summary")
    public ResponseEntity<?> getPaymentSummary(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserByJwt(jwt);
            if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                return new ResponseEntity<>("Access Denied: Admin role required", HttpStatus.FORBIDDEN);
            }

            List<Order> orders = orderService.getAllOrders();

            long totalOrders = orders.size();
            long totalRevenue = 0;
            long successfulOrders = 0;

            Map<String, Long> methodAmounts = new HashMap<>();
            Map<String, Long> methodCounts = new HashMap<>();

            String[] methods = { "Cash on Delivery", "Online (Razorpay)" };
            for (String m : methods) {
                methodAmounts.put(m, 0L);
                methodCounts.put(m, 0L);
            }

            Map<String, Long> monthlyRevMap = new LinkedHashMap<>();
            LocalDateTime now = LocalDateTime.now();
            for (int i = 5; i >= 0; i--) {
                String monthName = now.minusMonths(i).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                monthlyRevMap.put(monthName, 0L);
            }

            Map<String, Long> dailyCountMap = new LinkedHashMap<>();
            for (int i = 29; i >= 0; i--) {
                String dayLabel = now.minusDays(i).toLocalDate().toString();
                dailyCountMap.put(dayLabel, 0L);
            }

            List<Map<String, Object>> transactions = new ArrayList<>();

            for (Order order : orders) {
                String status = order.getStatus();
                boolean isSuccess = "DELIVERED".equalsIgnoreCase(status);
                long price = order.getTotalDiscountedPrice();

                String method = "Online (Razorpay)";
                if (order.getPaymentdetails() != null && order.getPaymentdetails().getPaymentMethod() != null) {
                    String rawMethod = order.getPaymentdetails().getPaymentMethod().trim().toUpperCase();
                    if ("COD".equals(rawMethod) || "CASH ON DELIVERY".equals(rawMethod)) {
                        method = "Cash on Delivery";
                    }
                }

                if (isSuccess) {
                    totalRevenue += price;
                    successfulOrders++;

                    methodAmounts.put(method, methodAmounts.getOrDefault(method, 0L) + price);
                    methodCounts.put(method, methodCounts.getOrDefault(method, 0L) + 1);

                    if (order.getCreatedAt() != null) {
                        String monthName = order.getCreatedAt().getMonth().getDisplayName(TextStyle.SHORT,
                                Locale.ENGLISH);
                        if (monthlyRevMap.containsKey(monthName)) {
                            monthlyRevMap.put(monthName, monthlyRevMap.get(monthName) + price);
                        }
                    }
                }

                if (order.getCreatedAt() != null) {
                    String dayLabel = order.getCreatedAt().toLocalDate().toString();
                    if (dailyCountMap.containsKey(dayLabel)) {
                        dailyCountMap.put(dayLabel, dailyCountMap.get(dayLabel) + 1);
                    }
                }

                Map<String, Object> tx = new HashMap<>();
                tx.put("orderId", order.getId());
                tx.put("customerName",
                        order.getUser() != null ? (order.getUser().getFirstName() + " " + order.getUser().getLastName())
                                : "Guest");
                tx.put("amount", price);
                tx.put("paymentMethod", method);
                tx.put("status",
                        order.getPaymentdetails() != null && order.getPaymentdetails().getPaymentStatus() != null
                                ? order.getPaymentdetails().getPaymentStatus().toUpperCase()
                                : "PENDING");
                tx.put("date", order.getCreatedAt() != null ? order.getCreatedAt().toString() : "");
                transactions.add(tx);
            }

            transactions.sort((a, b) -> ((String) b.get("date")).compareTo((String) a.get("date")));

            double successRate = totalOrders > 0 ? ((double) successfulOrders * 100.0 / totalOrders) : 0.0;
            double avgOrderValue = successfulOrders > 0 ? ((double) totalRevenue / successfulOrders) : 0.0;

            List<Map<String, Object>> byPaymentMethod = new ArrayList<>();
            for (String m : methodAmounts.keySet()) {
                if (methodCounts.get(m) > 0) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("method", m);
                    map.put("amount", methodAmounts.get(m));
                    map.put("count", methodCounts.get(m));
                    byPaymentMethod.add(map);
                }
            }

            List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
            for (String month : monthlyRevMap.keySet()) {
                Map<String, Object> map = new HashMap<>();
                map.put("month", month);
                map.put("revenue", monthlyRevMap.get(month));
                monthlyRevenue.add(map);
            }

            List<Map<String, Object>> dailyOrders = new ArrayList<>();
            for (String day : dailyCountMap.keySet()) {
                Map<String, Object> map = new HashMap<>();
                map.put("date", day);
                map.put("count", dailyCountMap.get(day));
                dailyOrders.add(map);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalRevenue", totalRevenue);
            response.put("totalOrders", totalOrders);
            response.put("avgOrderValue", avgOrderValue);
            response.put("successRate", successRate);
            response.put("byPaymentMethod", byPaymentMethod);
            response.put("monthlyRevenue", monthlyRevenue);
            response.put("dailyOrders", dailyOrders);
            response.put("recentTransactions", transactions);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
