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
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Productos (público)", description = "Catálogo público de productos")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Listar productos públicos")
    public List<ProductResponse> list(@RequestParam(required = false) String category) {
        return productService.listPublic(category);
    }

    @GetMapping("/{code}")
    @Operation(summary = "Obtener producto público por código")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public ProductResponse get(@PathVariable String code) {
        return productService.get(code, false);
    }
}
