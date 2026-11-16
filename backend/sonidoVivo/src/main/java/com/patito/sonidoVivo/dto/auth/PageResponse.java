package com.patito.sonidoVivo.dto.auth;

import java.util.List;

import org.springframework.data.domain.Page;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(title = "PageResponse", description = "Contenedor genérico para respuestas paginadas de la API.")
public class PageResponse<T> {

    @Schema(description = "Lista de elementos correspondientes a la página solicitada.")
    private List<T> content;

    @Schema(description = "Número de la página actual (comienza en 0).", example = "0")
    private int page;

    @Schema(description = "Cantidad máxima de elementos mostrados por página.", example = "10")
    private int size;

    @Schema(description = "Cantidad total de registros disponibles en la base de datos.", example = "45")
    private long totalElements;

    @Schema(description = "Número total de páginas disponibles según el tamaño configurado.", example = "5")
    private int totalPages;

    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(
                p.getContent(),
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages());
    }
}
