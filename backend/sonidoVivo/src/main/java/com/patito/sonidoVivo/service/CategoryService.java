package com.patito.sonidoVivo.service;

import com.patito.sonidoVivo.dto.catalogo.CategoryResponse;
import com.patito.sonidoVivo.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categories;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categories.findAll(Sort.by("name")).stream().map(CategoryResponse::from).toList();
    }
}