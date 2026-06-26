package com.emart.ecommerce.request;

import com.emart.ecommerce.model.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class AddItemRequest {
    private Long productId;
    private Size size;
    private int quantity;
    private int price;
}
