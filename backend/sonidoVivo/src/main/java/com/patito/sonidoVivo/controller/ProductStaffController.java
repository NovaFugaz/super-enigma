package com.patito.sonidoVivo.controller;

import com.patito.sonidoVivo.dto.catalogo.ProductRequest;
import com.patito.sonidoVivo.dto.catalogo.ProductResponse;
import com.patito.sonidoVivo.dto.catalogo.StockRequest;
import com.patito.sonidoVivo.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Productos (staff)")
@RestController
@RequestMapping("/api/staff/products")
@RequiredArgsConstructor
public class ProductStaffController {

    private final ProductService productService;

    //  SELLER y ADMIN 

    @GetMapping
    public List<ProductResponse> list(@RequestParam(required = false) String category,
                                      @RequestParam(required = false) String q,
                                      @RequestParam(defaultValue = "true") boolean includeInactive) {
        return productService.list(category, q, includeInactive);
    }

    @GetMapping("/{code}")
    public ProductResponse get(@PathVariable String code) {
        return productService.get(code, true);
    }

    @PatchMapping("/{code}/stock")
    public ProductResponse updateStock(@PathVariable String code,
                                       @Valid @RequestBody StockRequest request) {
        return productService.updateStock(code, request.stock());
    }

    //  Solo ADMIN 

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{code}")
    public ProductResponse update(@PathVariable String code,
                                  @Valid @RequestBody ProductRequest request) {
        return productService.update(code, request);
    }

    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable String code) {
        productService.deactivate(code);
    }
}
