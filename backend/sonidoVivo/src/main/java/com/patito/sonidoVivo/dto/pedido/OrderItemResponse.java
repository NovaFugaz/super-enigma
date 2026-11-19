package com.patito.sonidoVivo.dto.pedido;

import com.patito.sonidoVivo.model.OrderItem;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Order Item Response", description = "Respuesta de un pedido confirmado")
public record OrderItemResponse(

        @Schema(description = "Código único del producto (SKU) al momento de la compra", example = "GTR-GIB-001") 
        String code,

        @Schema(description = "Nombre comercial del producto", example = "Guitarra Acústica ProMax") 
        String name,

        @Schema(description = "Marca fabricante del producto", example = "Gibson", nullable = true) 
        String brand,

        @Schema(description = "Modelo específico del producto", example = "J-45 Standard", nullable = true) 
        String model,

        @Schema(description = "Precio unitario cobrado al momento de realizar el pedido en CLP", example = "250000") 
        Integer unitPrice,

        @Schema(description = "Cantidad de unidades adquiridas", example = "2") 
        Integer quantity,

        @Schema(description = "Subtotal de la línea (unitPrice * quantity) en CLP", example = "500000") 
        Integer lineTotal) {
    public static OrderItemResponse from(OrderItem i) {
        return new OrderItemResponse(i.getCode(), i.getName(), i.getBrand(), i.getModel(),
                i.getUnitPrice(), i.getQuantity(), i.getLineTotal());
    }
}
