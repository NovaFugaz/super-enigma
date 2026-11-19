package com.patito.sonidoVivo.dto.catalogo;

import com.patito.sonidoVivo.model.Product;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Product Response", description = "Respuesta de la información de un producto")
public record ProductResponse(
    
        @Schema(description = "Código único del producto (SKU)", example = "GTR-GIB-001")
        String code,

        @Schema(description = "Categoría de un producto", example = "guitarras")
        String category,

        @Schema(description = "Nombre de un producto", example = "Guitarra Acústica ProMax")
        String name,

        @Schema(description = "Marca de un producto", example = "Gibson")
        String brand,

        @Schema(description = "Modelo de un producto", example = "J-45 Standard")
        String model,

        @Schema(description = "Precio unitario de un producto", example = "250000")
        Integer price,

        @Schema(description = "Stock de un producto", example = "10")
        Integer stock,

        @Schema(description = "Descripción de un producto")
        String description,

        @Schema(description = "URLimagen de un producto")
        String image,

        @Schema(description = "Estado de un producto", example = "true")
        boolean active
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getCode(), p.getCategory().getSlug(),
                p.getName(), p.getBrand(), p.getModel(), p.getPrice(),
                p.getStock(), p.getDescription(), p.getImage(), p.isActive());
    }
}
