package com.patito.sonidoVivo.dto.catalogo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Schema(title = "Stock Request", description = "Datos necesarios para el stock")
public record StockRequest(

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock debe ser un entero mayor o igual a cero")
        @Schema(description = "Stock de un producto")
        Integer stock
) {}