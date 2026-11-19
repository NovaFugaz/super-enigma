package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.catalogo.ProductResponse;
import com.patito.sonidoVivo.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Endpoints para la consulta y búsqueda de productos.")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Listar y filtrar productos", 
        description = "Obtiene el catálogo de productos disponibles. Permite filtrar opcionalmente por categoría y término de búsqueda.")
     @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Lista de productos obtenida exitosamente",
            content = @Content(mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = ProductResponse.class))
            )
        )
    })
        public List<ProductResponse> list(@RequestParam(required = false) String category,
                                      @RequestParam(required = false) String q) {
        return productService.list(category, q, false);
    }

    @GetMapping("/{code}")
    @Operation(summary = "Obtener un producto por código",
            description = "Devuelde el detalle completo del producto específico mediante su código único"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Producto encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Producto no encontrado con el código proporcionado",
            content = @Content
        )
    })
    public ProductResponse get(@PathVariable String code) {
        return productService.get(code, false);
    }
}
