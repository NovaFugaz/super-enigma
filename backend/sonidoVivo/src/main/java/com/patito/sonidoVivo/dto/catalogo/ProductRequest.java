package com.patito.sonidoVivo.dto.catalogo;

import com.patito.sonidoVivo.dto.common.Patterns;

import jakarta.validation.constraints.*;

public record ProductRequest(

        @NotBlank(message = "El código es obligatorio")
        @Pattern(regexp = Patterns.PRODUCT_CODE,
                 message = "El código solo admite mayúsculas, números y guiones")
        @Size(max = 20, message = "El código no puede superar los 20 caracteres")
        String code,

        @NotBlank(message = "La categoría es obligatoria")
        String category,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
        String name,

        @Size(max = 60, message = "La marca no puede superar los 60 caracteres")
        String brand,

        @Size(max = 60, message = "El modelo no puede superar los 60 caracteres")
        String model,

        @NotNull(message = "El precio es obligatorio")
        @PositiveOrZero(message = "El precio no puede ser negativo")
        Integer price,

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock no puede ser negativo")
        Integer stock,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String description,

        @Size(max = 255, message = "La imagen no puede superar los 255 caracteres")
        String image,

        Boolean active
) {
    public ProductRequest {
        if (code != null) code = code.trim().toUpperCase();
    }
}
