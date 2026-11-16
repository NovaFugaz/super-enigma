package com.patito.sonidoVivo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.patito.sonidoVivo.dto.product.MetadataResponse;
import com.patito.sonidoVivo.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class CategoryService 
{
    private final CategoryRepository categoryRepository;

    public List<MetadataResponse> list() {
        return categoryRepository.findAll().stream()
            .map(c -> new MetadataResponse(c.getId(), c.getSlug(), c.getName(),
                c.getDescription(), c.getImageUrl())).toList();
    }
}
