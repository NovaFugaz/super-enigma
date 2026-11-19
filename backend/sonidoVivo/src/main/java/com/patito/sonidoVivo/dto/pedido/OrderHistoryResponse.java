package com.patito.sonidoVivo.dto.pedido;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.model.OrderStatusHistory;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(title = "Order History Response", description = "Registro individual de un cambio de estado dentro del historial de un pedido")
public record OrderHistoryResponse(

        @Schema(description = "Estado anterior del pedido antes del cambio (null en el registro de creación inicial)", 
            example = "PENDING", nullable = true) 
        OrderStatus from,

        @Schema(description = "Nuevo estado asignado al pedido", example = "PAID") 
        OrderStatus status,

        @Schema(description = "Nombre del usuario o administrador que ejecutó el cambio de estado (null si fue automático del sistema)", 
            example = "Camila González", nullable = true) 
        String actorName,

        @Schema(description = "Fecha y hora exacta (UTC ISO-8601) en que se registró el cambio de estado", example = "2026-11-19T14:07:00Z") 
        Instant createdAt) {
    public static OrderHistoryResponse from(OrderStatusHistory h) {
        return new OrderHistoryResponse(h.getFromStatus(), h.getToStatus(),
                h.getActor() != null ? h.getActor().getName() : null, h.getCreatedAt());
    }
}