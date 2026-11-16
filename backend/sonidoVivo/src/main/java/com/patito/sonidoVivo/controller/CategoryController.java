package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.product.MetadataResponse;
import com.patito.sonidoVivo.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<MetadataResponse> list() {
        return categoryService.list();
    }
}
