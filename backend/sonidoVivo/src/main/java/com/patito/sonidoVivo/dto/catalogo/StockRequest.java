package com.patito.sonidoVivo.dto.catalogo;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record StockRequest(

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock debe ser un entero mayor o igual a cero")
        Integer stock
) {}