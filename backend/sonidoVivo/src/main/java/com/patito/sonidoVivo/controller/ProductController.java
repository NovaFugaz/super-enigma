package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.catalogo.ProductResponse;
import com.patito.sonidoVivo.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductResponse> list(@RequestParam(required = false) String category,
                                      @RequestParam(required = false) String q) {
        return productService.list(category, q, false);
    }

    @GetMapping("/{code}")
    public ProductResponse get(@PathVariable String code) {
        return productService.get(code, false);
    }
}
