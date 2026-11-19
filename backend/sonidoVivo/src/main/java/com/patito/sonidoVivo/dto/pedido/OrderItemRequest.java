package com.patito.sonidoVivo.dto.pedido;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(title = "Order Item Request",
description = "Datos necesarios para un producto y la cantidad solicitada dentro de un pedido")
public record OrderItemRequest(

        @NotBlank(message = "El código del producto es obligatorio")
        @Size(max = 20, message = "El código no puede superar los 20 caracteres")
        @Schema(description = "Código único del producto (SKU) a agregar al pedido",
                example = "GTR-GIB-001")
        String code,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima es 1")
        @Schema(description = "Cantidad de unidades solicitadas del producto (mínimo 1)",
                example = "2",minimum = "1")
        Integer quantity
) {}