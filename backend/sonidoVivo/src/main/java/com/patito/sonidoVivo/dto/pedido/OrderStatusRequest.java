package com.patito.sonidoVivo.dto.pedido;

import com.patito.sonidoVivo.enums.OrderStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(title = "Order Status Request",description = "Datos requeridos para actualizar el estado de un pedido")
public record OrderStatusRequest(

        @NotNull(message = "El estado es obligatorio")
        @Schema(description = "Nuevo estado al que pasará el pedido",example = "SHIPPED")
        OrderStatus status
) {}