package com.patito.sonidoVivo.dto.pedido;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.ShippingMethod;
import com.patito.sonidoVivo.model.CustomerOrder;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(title = "Order Tracking Response", description = "Información pública de seguimiento de un pedido mediante su número de rastreo")
public record OrderTrackingResponse(

        @Schema(description = "Identificador único interno del pedido", example = "") String id,

        @Schema(description = "Código público de seguimiento del pedido", example = "SV-TRK-984321")
        String trackingNumber,

        @Schema(description = "Estado actual en el que se encuentra el pedido", example = "SHIPPED") 
        OrderStatus status,

        @Schema(description = "Fecha y hora de creación del pedido (UTC ISO-8601)", example = "2026-11-19T14:11:00Z") 
        Instant createdAt,

        @Schema(description = "Modalidad de entrega seleccionada para el pedido", example = "DOMICILIO") 
        ShippingMethod shippingMethod,

        @Schema(description = "Resumen de productos y cantidades incluidos en el envío") List<Line> items,

        @Schema(description = "Línea de tiempo cronológica con los estados por los que ha pasado el pedido") 
        List<Event> statusHistory) {

        @Schema(title = "Tracking Order Line", description = "Resumen de producto y cantidad dentro de la vista de seguimiento")
        public record Line(
                @Schema(description = "Nombre comercial del producto", example = "Guitarra Acústica ProMax") 
                String name,

                @Schema(description = "Cantidad de unidades incluidas en el pedido", example = "2") 
                Integer quantity) {
        }

        @Schema(title = "Tracking Status Event", description = "Hito registrado en la línea de tiempo de seguimiento del pedido")
        public record Event(
                        @Schema(description = "Estado alcanzado por el pedido", example = "PAID") 
                        OrderStatus status,

                        @Schema(description = "Fecha y hora exacta en que ocurrió el evento (UTC ISO-8601)", example = "2026-11-19T14:14:00Z") 
                        Instant createdAt) {
        }

        public static OrderTrackingResponse from(CustomerOrder o) {
                return new OrderTrackingResponse(
                                o.getId(),
                                o.getTrackingNumber(),
                                o.getStatus(),
                                o.getCreatedAt(),
                                o.getShippingMethod(),
                                o.getItems().stream()
                                                .map(i -> new Line(i.getName(), i.getQuantity()))
                                                .toList(),
                                o.getStatusHistory().stream()
                                                .map(h -> new Event(h.getToStatus(), h.getCreatedAt()))
                                                .toList());
        }
}
