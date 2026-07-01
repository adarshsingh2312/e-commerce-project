package com.emart.ecommerce.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private String razorpay_payment_id;
    private String razorpay_order_id;
    private String razorpay_signature;
}
