package com.emart.ecommerce.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetails {
    private String paymentMethod;
    private String paymentId;
    private String paymentStatus;
    private String razorpayPaymentLinkId;
    private String razorpayPaymentId;
}
