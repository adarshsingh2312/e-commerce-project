package com.emart.ecommerce.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Size {
    private String name;
    private int qty;
}
