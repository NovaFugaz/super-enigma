package com.patito.sonidoVivo.controller;

import com.patito.sonidoVivo.dto.catalogo.ProductRequest;
import com.patito.sonidoVivo.dto.catalogo.ProductResponse;
import com.patito.sonidoVivo.dto.catalogo.StockRequest;
import com.patito.sonidoVivo.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Productos (staff)", description = "Gestión de inventario y catálogo.")
@RestController
@RequestMapping("/api/staff/products")
@RequiredArgsConstructor
public class ProductStaffController {

    private final ProductService productService;

    //  SELLER y ADMIN 

    @GetMapping
    @Operation(summary = "Listar productos (Staff)",description = "Obtiene el catálogo completo.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Lista de productos obtenida exitosamente",
            content = @Content(
                mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = ProductResponse.class))
            )
        ),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
        @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content)
    })
    public List<ProductResponse> list(@RequestParam(required = false) String category,
                                      @RequestParam(required = false) String q,
                                      @RequestParam(defaultValue = "true") boolean includeInactive) {
        return productService.list(category, q, includeInactive);
    }

    @GetMapping("/{code}")
    @Operation(summary = "Obtener producto por código", description = "Devuelve el detalle de un producto específico.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Stock actualizado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Cantidad de stock inválida (ej. negativa)", content = @Content),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
        @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content)
    })
    public ProductResponse get(@PathVariable String code) {
        return productService.get(code, true);
    }

    @PatchMapping("/{code}/stock")
    @Operation(summary = "Actualizar stock de un producto",
        description = "Modifica únicamente la cantidad disponible en inventario de un producto.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Stock actualizado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Cantidad de stock inválida (ej. negativa)", content = @Content),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
        @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content)
    })
    public ProductResponse updateStock(@PathVariable String code,
                                       @Valid @RequestBody StockRequest request) {
        return productService.updateStock(code, request.stock());
    }

    //  Solo ADMIN 

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo producto",description = "Registra un nuevo producto en el catálogo.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Producto creado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Datos del producto inválidos o código duplicado", content = @Content),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
        @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN)", content = @Content)
    })
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{code}")
    @Operation(summary = "Actualizar un producto existente", description = "Actualiza los datos de un producto.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Producto actualizado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos", content = @Content),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
        @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN)", content = @Content),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content)
    })
    public ProductResponse update(@PathVariable String code,
                                  @Valid @RequestBody ProductRequest request) {
        return productService.update(code, request);
    }

    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Desactivar un producto (Borrado lógico)",description = "Marca el producto como inactivo para ocultarlo del catálogo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Producto desactivado exitosamente", content = @Content),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
        @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN)", content = @Content),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content)
    })
    public void deactivate(@PathVariable String code) {
        productService.deactivate(code);
    }
}
