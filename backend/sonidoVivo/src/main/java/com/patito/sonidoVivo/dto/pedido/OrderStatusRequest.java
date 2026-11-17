package com.patito.sonidoVivo.dto.pedido;

import com.patito.sonidoVivo.enums.OrderStatus;

import jakarta.validation.constraints.NotNull;

public record OrderStatusRequest(

        @NotNull(message = "El estado es obligatorio")
        OrderStatus status
) {}