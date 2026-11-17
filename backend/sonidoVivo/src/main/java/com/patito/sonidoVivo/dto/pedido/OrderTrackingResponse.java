package com.patito.sonidoVivo.dto.pedido;

import java.time.Instant;
import java.util.List;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.ShippingMethod;
import com.patito.sonidoVivo.model.CustomerOrder;

public record OrderTrackingResponse(
        String id,
        String trackingNumber,
        OrderStatus status,
        Instant createdAt,
        ShippingMethod shippingMethod,
        List<Line> items,
        List<Event> statusHistory
) {
    public record Line(String name, Integer quantity) {}

    public record Event(OrderStatus status, Instant createdAt) {}

    public static OrderTrackingResponse from(CustomerOrder o) {
        return new OrderTrackingResponse(
                o.getId(), o.getTrackingNumber(), o.getStatus(), o.getCreatedAt(),
                o.getShippingMethod(),
                o.getItems().stream().map(i -> new Line(i.getName(), i.getQuantity())).toList(),
                o.getStatusHistory().stream()
                        .map(h -> new Event(h.getToStatus(), h.getCreatedAt())).toList());
    }
}