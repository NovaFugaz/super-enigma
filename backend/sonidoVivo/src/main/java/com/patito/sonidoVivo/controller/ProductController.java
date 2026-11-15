package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.PageResponse;
import com.patito.sonidoVivo.dto.ProductActiveRequest;
import com.patito.sonidoVivo.dto.ProductRequest;
import com.patito.sonidoVivo.dto.ProductResponse;
import com.patito.sonidoVivo.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<PageResponse<ProductResponse>> search(
            @RequestParam(name = "categoria", required = false) String categoria,
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "marcas", required = false) List<String> marcas,
            @RequestParam(name = "min", required = false) Long min,
            @RequestParam(name = "max", required = false) Long max,
            @RequestParam(name = "soloStock", defaultValue = "false") boolean soloStock,
            @RequestParam(name = "sort", defaultValue = "nombre") String sort,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", required = false) Integer size) {
        return ResponseEntity.ok(productService.searchCatalog(categoria, q, marcas, min, max, soloStock, sort,
                page, size));
    }

    @GetMapping("/products/featured")
    public ResponseEntity<List<ProductResponse>> featured() {
        return ResponseEntity.ok(productService.findFeatured());
    }

    @GetMapping("/products/brands")
    public ResponseEntity<List<String>> brands(
            @RequestParam(name = "categoria", required = false) String categoria) {
        return ResponseEntity.ok(productService.findBrands(categoria));
    }

    @GetMapping("/products/{code}")
    public ResponseEntity<ProductResponse> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(productService.findActiveByCode(code));
    }

    @GetMapping("/admin/products")
    public ResponseEntity<PageResponse<ProductResponse>> searchAdmin(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", required = false) Integer size) {
        return ResponseEntity.ok(productService.searchAdmin(q, page, size));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/products/{code}")
    public ResponseEntity<ProductResponse> update(@PathVariable String code,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(code, request));
    }

    @PatchMapping("/products/{code}/active")
    public ResponseEntity<ProductResponse> setActive(@PathVariable String code,
            @Valid @RequestBody ProductActiveRequest request) {
        return ResponseEntity.ok(productService.setActive(code, request.getActive()));
    }
}