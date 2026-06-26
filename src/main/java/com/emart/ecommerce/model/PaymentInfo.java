package com.emart.ecommerce.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
//@Embeddable
public class PaymentInfo {
    @Column(name = "cardholder_name", nullable = false)
    private String cardHoldername;
    @Column(name = "card_number", nullable = false)
    private String cardNumber;
    @Column(name = "cvv",nullable = false)
    private String cvv;
    @Column(name = "expiration_date", nullable = false)
    private LocalDate expirationDate;
}
