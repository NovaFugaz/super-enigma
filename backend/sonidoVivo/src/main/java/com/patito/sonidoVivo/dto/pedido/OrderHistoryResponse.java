package com.patito.sonidoVivo.dto.pedido;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.model.OrderStatusHistory;

import java.time.Instant;

public record OrderHistoryResponse(
        OrderStatus from,    
        OrderStatus status,
        String actorName,   
        Instant createdAt
) {
    public static OrderHistoryResponse from(OrderStatusHistory h) {
        return new OrderHistoryResponse(h.getFromStatus(), h.getToStatus(),
                h.getActor() != null ? h.getActor().getName() : null, h.getCreatedAt());
    }
}