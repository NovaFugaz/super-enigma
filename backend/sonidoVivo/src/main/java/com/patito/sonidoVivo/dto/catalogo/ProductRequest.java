package com.patito.sonidoVivo.dto.catalogo;

import com.patito.sonidoVivo.dto.common.Patterns;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(title = "Product Request", description = "Dato necesarios para el producto")
public record ProductRequest(

        @NotBlank(message = "El código es obligatorio")
        @Pattern(regexp = Patterns.PRODUCT_CODE,
                 message = "El código solo admite mayúsculas, números y guiones")
        @Size(max = 20, message = "El código no puede superar los 20 caracteres")
        @Schema(description = "Codigo", example = "049000006346")
        String code,

        @NotBlank(message = "La categoría es obligatoria")
        @Schema(description = "La categoría es obligatoria", example = "Bateria")
        String category,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
        @Schema(description = "Nombre del producto", example = "Guitarra acustica - ProMax")
        String name,

        @Size(max = 60, message = "La marca no puede superar los 60 caracteres")
        @Schema(description = "Marca del producto", example = "Gibson")
        String brand,

        @Size(max = 60, message = "El modelo no puede superar los 60 caracteres")
        @Schema(description = "Modelo del producto", example = "Guitarra Clásica")
        String model,

        @NotNull(message = "El precio es obligatorio")
        @PositiveOrZero(message = "El precio no puede ser negativo")
        @Schema(description = "Precio de un producto")
        Integer price,

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock no puede ser negativo")
        @Schema(description = "Stock disponible de un producto", example = "10")
        Integer stock,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        @Schema(description = "Descripción de un produco")
        String description,

        @Size(max = 255, message = "La imagen no puede superar los 255 caracteres")
        @Schema(description = "Imagen de un producto")
        String image,

        Boolean active
) {
    public ProductRequest {
        if (code != null) code = code.trim().toUpperCase();
    }
}
