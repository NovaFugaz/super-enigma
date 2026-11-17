package com.patito.sonidoVivo.dto.catalogo;

import jakarta.validation.constraints.*;

public record ProductoActualizarRequest(

        @NotBlank(message = "La categoría es obligatoria")
        String categoriaSlug,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
        String nombre,

        @Size(max = 60, message = "La marca no puede superar los 60 caracteres")
        String marca,

        @Size(max = 60, message = "El modelo no puede superar los 60 caracteres")
        String modelo,

        @NotNull(message = "El precio es obligatorio")
        @PositiveOrZero(message = "El precio no puede ser negativo")
        Integer precio,

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock no puede ser negativo")
        Integer stock,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String descripcion,

        @Size(max = 255, message = "La imagen no puede superar los 255 caracteres")
        String imagen,

        @NotNull(message = "Debes indicar si el producto está activo")
        Boolean activo
) {}
