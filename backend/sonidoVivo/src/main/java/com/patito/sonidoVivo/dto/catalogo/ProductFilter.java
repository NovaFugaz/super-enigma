package com.patito.sonidoVivo.dto.catalogo;

import java.util.List;

public record ProductFilter(
        String category,
        List<String> brands,
        String model,
        String code,
        boolean includeInactive
) {}
