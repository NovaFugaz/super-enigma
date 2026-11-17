package com.patito.sonidoVivo.dto.catalogo;

import com.patito.sonidoVivo.model.Category;

public record CategoryResponse(
        String slug,
        String name,
        String description,
        String image
) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getSlug(), c.getName(),
                c.getDescription(), c.getImage());
    }
}