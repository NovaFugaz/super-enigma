package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.catalogo.CategoryResponse;
import com.patito.sonidoVivo.service.CategoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categorías", description = "Consulta de categorías del catálogo")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Listar todas las categorías", 
        description = "Obtiene el listado completo de categorías disponibles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
            description = "Lista de categorías obtenidas exitosamente",
            content = @Content(mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = CategoryResponse.class))
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error interno del servidor al consultar las categorías",
            content = @Content 
        )
    })
    public List<CategoryResponse> list() {
        return categoryService.findAll();
    }
}
