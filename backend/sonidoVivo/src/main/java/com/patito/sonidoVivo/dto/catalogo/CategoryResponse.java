package com.patito.sonidoVivo.dto.catalogo;

import com.patito.sonidoVivo.model.Category;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Categoria", description = "Respuesta de las categorías de productos")
public record CategoryResponse(

        @Schema(description = "Slug")
        String slug,

        @Schema(description = "Nombre de la categoría")
        String name,

        @Schema(description = "Descripción de categoría")
        String description,

        @Schema(description = "ImagenUrl de la categoría")
        String image
) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getSlug(), c.getName(),
                c.getDescription(), c.getImage());
    }
}