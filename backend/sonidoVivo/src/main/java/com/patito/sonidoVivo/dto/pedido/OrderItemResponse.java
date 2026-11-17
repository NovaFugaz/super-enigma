package com.patito.sonidoVivo.dto.pedido;

import com.patito.sonidoVivo.model.OrderItem;

public record OrderItemResponse(
        String code,
        String name,
        String brand,
        String model,
        Integer unitPrice,
        Integer quantity,
        Integer lineTotal
) {
    public static OrderItemResponse from(OrderItem i) {
        return new OrderItemResponse(i.getCode(), i.getName(), i.getBrand(), i.getModel(),
                i.getUnitPrice(), i.getQuantity(), i.getLineTotal());
    }
}
