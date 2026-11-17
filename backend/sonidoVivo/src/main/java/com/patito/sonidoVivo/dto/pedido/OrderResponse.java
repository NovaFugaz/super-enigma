package com.patito.sonidoVivo.dto.pedido;

import java.time.Instant;
import java.util.List;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.ShippingMethod;
import com.patito.sonidoVivo.model.CustomerOrder;

public record OrderResponse(
        String id,
        String trackingNumber,
        OrderStatus status,
        Instant createdAt,
        Long customerId,
        String customerName,
        String customerEmail,
        Shipping shipping,
        List<OrderItemResponse> items,
        Integer subtotal,
        Integer tax,
        Integer shippingCost,
        Integer total,
        Payment payment,
        Receipt receipt,
        List<OrderHistoryResponse> statusHistory
) {
    public record Pickup(String name, String address) {}

    public record Shipping(ShippingMethod method, String address, Pickup pickup) {}

    public record Payment(String status, String transactionId, String authorizationCode) {}

    public record Receipt(String number, Instant issuedAt) {}

    public static OrderResponse from(CustomerOrder o) {
        Pickup pickup = o.getPickupLocation() == null ? null
                : new Pickup(o.getPickupLocation().getName(), o.getPickupLocation().getAddress());

        return new OrderResponse(
                o.getId(), o.getTrackingNumber(), o.getStatus(), o.getCreatedAt(),
                o.getCustomer().getId(), o.getCustomer().getName(), o.getCustomer().getEmail(),
                new Shipping(o.getShippingMethod(), o.getShippingAddress(), pickup),
                o.getItems().stream().map(OrderItemResponse::from).toList(),
                o.getSubtotal(), o.getTax(), o.getShippingCost(), o.getTotal(),
                new Payment("aprobado", o.getPaymentTransactionId(), o.getPaymentAuthorization()),
                new Receipt(o.getReceiptNumber(), o.getCreatedAt()),
                o.getStatusHistory().stream().map(OrderHistoryResponse::from).toList());
    }
}
