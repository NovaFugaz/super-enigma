package com.patito.sonidoVivo.dto.catalogo;

import com.patito.sonidoVivo.model.Product;

public record ProductResponse(
        String code,
        String category,
        String name,
        String brand,
        String model,
        Integer price,
        Integer stock,
        String description,
        String image,
        boolean active
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getCode(), p.getCategory().getSlug(),
                p.getName(), p.getBrand(), p.getModel(), p.getPrice(),
                p.getStock(), p.getDescription(), p.getImage(), p.isActive());
    }
}
