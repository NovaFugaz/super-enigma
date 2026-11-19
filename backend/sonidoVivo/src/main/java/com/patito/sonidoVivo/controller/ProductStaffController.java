package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.catalogo.ProductRequest;
import com.patito.sonidoVivo.dto.catalogo.ProductResponse;
import com.patito.sonidoVivo.dto.catalogo.StockRequest;
import com.patito.sonidoVivo.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/staff/products")
@RequiredArgsConstructor
@Tag(name = "Productos (staff)", description = "Panel Administrador y vendedor para el CRUD de productos")
@SecurityRequirement(name = "bearerAuth")
public class ProductStaffController {

    private final ProductService productService;

    // SELLER y ADMIN

    @GetMapping
    @Operation(summary = "Listar productos (vista interna)")
    public List<ProductResponse> list(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String code,
            @RequestParam(defaultValue = "true") boolean includeInactive) {
        return productService.listStaff(brand, model, code, includeInactive);
    }

    @GetMapping("/{code}")
    @Operation(summary = "Obtener producto por código (incluye inactivos)")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public ProductResponse get(@PathVariable String code) {
        return productService.get(code, true);
    }

    @PatchMapping("/{code}/stock")
    @Operation(summary = "Actualizar stock de un producto")
    @ApiResponse(responseCode = "400", description = "Stock inválido")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public ProductResponse updateStock(
            @PathVariable String code,
            @Valid @RequestBody StockRequest request) {
        return productService.updateStock(code, request.stock());
    }

    // Solo ADMIN

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear nuevo producto (solo ADMIN)")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o código duplicado")
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{code}")
    @Operation(summary = "Actualizar producto completo (solo ADMIN)")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public ProductResponse update(
            @PathVariable String code,
            @Valid @RequestBody ProductRequest request) {
        return productService.update(code, request);
    }

    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Dar de baja un producto (solo ADMIN)")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public void deactivate(@PathVariable String code) {
        productService.deactivate(code);
    }
}
