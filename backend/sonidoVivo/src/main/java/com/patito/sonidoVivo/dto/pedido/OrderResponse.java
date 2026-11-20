package com.patito.sonidoVivo.dto.pedido;

import java.time.Instant;
import java.util.List;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.ShippingMethod;
import com.patito.sonidoVivo.model.CustomerOrder;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Order Response", description = "Respuesta la realizar un pedido")
public record OrderResponse(

        @Schema(description = "Identificador único interno del pedido", example = "ord-2026-000145") 
        String id,

        @Schema(description = "Código público de seguimiento del pedido", example = "SV-TRK-984321") 
        String trackingNumber,

        @Schema(description = "Estado actual del pedido", example = "PAID") 
        OrderStatus status,

        @Schema(description = "Fecha y hora de creación del pedido (UTC ISO-8601)", example = "2026-11-19T14:11:00Z") 
        Instant createdAt,

        @Schema(description = "Identificador único del cliente que realizó el pedido", example = "1") 
        Long customerId,

        @Schema(description = "Nombre completo del cliente", example = "Alan Brito") 
        String customerName,

        @Schema(description = "Correo electrónico del cliente", example = "cliente01@gmail.com") 
        String customerEmail,

        @Schema(description = "Información del método de entrega y destino del pedido") 
        Shipping shipping,

        @Schema(description = "Listado de productos incluidos en el pedido") 
        List<OrderItemResponse> items,

        @Schema(description = "Suma neta de los productos antes de impuestos y envío en CLP", example = "420168") 
        Integer subtotal,

        @Schema(description = "Monto correspondiente a impuestos (IVA 19%) en CLP", example = "79832") 
        Integer tax,

        @Schema(description = "Costo asociado al despacho en CLP (0 si es retiro en tienda)", example = "5990") 
        Integer shippingCost,

        @Schema(description = "Monto total final cobrado al cliente en CLP", example = "505990") 
        Integer total,

        @Schema(description = "Información del pago procesado para el pedido") 
        Payment payment,

        @Schema(description = "Datos del comprobante o boleta emitida") 
        Receipt receipt,

        @Schema(description = "Historial cronológico de cambios de estado del pedido") 
        List<OrderHistoryResponse> statusHistory) {
        @Schema(title = "Order Pickup", description = "Datos de la sucursal seleccionada cuando el método de envío es RETIRO")
        public record Pickup(
                @Schema(description = "Nombre comercial del punto de retiro", example = "Starken Viña Batuco") 
                String name,

                @Schema(description = "Dirección física del punto de retiro", example = "Av. Valparaíso 1195, Viña del Mar, Valparaíso") 
                String address) {
        }

        @Schema(title = "Order Shipping", description = "Detalle de entrega del pedido (despacho a domicilio o retiro en sucursal)")
        public record Shipping(
                @Schema(description = "Modalidad de entrega seleccionada", example = "DOMICILIO") 
                ShippingMethod method,

                @Schema(description = "Dirección de entrega a domicilio", 
                        example = "Av Ejemplo 123", nullable = true) 
                String address,

                @Schema(description = "Información de sucursal de retiro (null si el método es DOMICILIO)", nullable = true) 
                Pickup pickup) {
        }

        @Schema(title = "Order Payment", description = "Resumen de la transacción de pago asociada al pedido")
        public record Payment(
                        @Schema(description = "Estado final del pago", example = "aprobado") 
                        String status,

                        @Schema(description = "Identificador único de la transacción entregado por la pasarela") 
                        String transactionId,

                        @Schema(description = "Código de autorización bancaria o de pago") 
                        String authorizationCode) {
        }

        @Schema(title = "OrderReceipt", description = "Comprobante tributario o boleta generada para el pedido")
        public record Receipt(
                        @Schema(description = "Número correlativo de boleta o comprobante", example = "BOL-000145") 
                        String number,

                        @Schema(description = "Fecha y hora de emisión del comprobante (UTC ISO-8601)", example = "2026-11-19T14:11:00Z")
                        Instant issuedAt){}

        public static OrderResponse from(CustomerOrder o) {
                        Pickup pickup = o.getPickupLocation() == null ? null
                                        : new Pickup(o.getPickupLocation().getName(),
                                                        o.getPickupLocation().getAddress());

                        return new OrderResponse(
                                        o.getId(), o.getTrackingNumber(), o.getStatus(), o.getCreatedAt(),
                                        o.getCustomer().getId(), o.getCustomer().getName(), o.getCustomer().getEmail(),
                                        new Shipping(o.getShippingMethod(), o.getShippingAddress(), pickup),
                                        o.getItems().stream().map(OrderItemResponse::from).toList(),
                                        o.getSubtotal(), o.getTax(), o.getShippingCost(), o.getTotal(),
                                        new Payment("aprobado", o.getPaymentTransactionId(),
                                                        o.getPaymentAuthorization()),
                                        new Receipt(o.getReceiptNumber(), o.getCreatedAt()),
                                        o.getStatusHistory().stream().map(OrderHistoryResponse::from).toList());
                }
}
