package com.patito.sonidoVivo.dto.pedido;

import java.time.Instant;
import java.util.List;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.model.CustomerOrder;

import io.swagger.v3.oas.annotations.media.Schema;

// Esto es para el endpoint GET /api/orders/mine, que devuelve un resumen de los pedidos del cliente autenticado, sin datos de pago ni envío. 
// Para obtener los detalles completos de un pedido, se debe usar GET /api/orders/{id}.
@Schema(title = "Resumen de Pedido", description = "Resumen de un pedido del cliente autenticado, sin datos de pago ni envío")
public record OrderMineResponse(

        @Schema(description = "Identificador único del pedido")
        String id,

        @Schema(description = "Código público de seguimiento")
        String trackingNumber,

        @Schema(description = "Estado actual del pedido")
        OrderStatus status,

        @Schema(description = "Fecha y hora de creación del pedido")
        Instant createdAt,

        @Schema(description = "Productos adquiridos y sus precios al momento de la compra")
        List<OrderItemResponse> items,

        @Schema(description = "Total del pedido en $CLP")
        Integer total,

        @Schema(description = "Historial de estados del pedido")
        List<StatusUpdate> statusHistory) {

    @Schema(title = "Order Status Update", description = "Estado y fecha del cambio, sin identificar al personal que lo registró")
    public record StatusUpdate(OrderStatus status, Instant createdAt) {}

    public static OrderMineResponse from(CustomerOrder order) {
        return new OrderMineResponse(
                order.getId(),
                order.getTrackingNumber(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getTotal(),
                order.getStatusHistory().stream()
                        .map(history -> new StatusUpdate(history.getToStatus(), history.getCreatedAt()))
                        .toList());
    }
}
