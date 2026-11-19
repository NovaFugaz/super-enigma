package com.patito.sonidoVivo.dto.pedido;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderItemRequest(

        @NotBlank(message = "El código del producto es obligatorio")
        @Size(max = 20, message = "El código no puede superar los 20 caracteres")
        String code,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima es 1")
        Integer quantity
) {}