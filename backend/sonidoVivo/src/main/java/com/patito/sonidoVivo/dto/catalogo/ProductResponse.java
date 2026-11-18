package com.patito.sonidoVivo.dto.catalogo;

import com.patito.sonidoVivo.model.Product;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Product Response", description = "Respuesta de un producto")
public record ProductResponse(
    
        @Schema(description = "Código de un producto")
        String code,

        @Schema(description = "Categoría de un producto")
        String category,

        @Schema(description = "Nombre de un producto")
        String name,

        @Schema(description = "Marca de un producto")
        String brand,

        @Schema(description = "Modelo de un producto")
        String model,

        @Schema(description = "Precio de un producto")
        Integer price,

        @Schema(description = "Stock de un producto")
        Integer stock,

        @Schema(description = "Descripción de un producto")
        String description,

        @Schema(description = "Imagen de un producto")
        String image,

        @Schema(description = "Estado de un producto")
        boolean active
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getCode(), p.getCategory().getSlug(),
                p.getName(), p.getBrand(), p.getModel(), p.getPrice(),
                p.getStock(), p.getDescription(), p.getImage(), p.isActive());
    }
}
