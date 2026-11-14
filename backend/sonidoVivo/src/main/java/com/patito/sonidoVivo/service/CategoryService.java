package com.patito.sonidoVivo.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.patito.sonidoVivo.dto.CategoryRequest;
import com.patito.sonidoVivo.exception.ConflictException;
import com.patito.sonidoVivo.exception.ResourceNotFoundException;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
    }

    @Transactional(readOnly = true)
    public Category findBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + slug));
    }

    @Transactional
    public Category create(CategoryRequest request) {
        String slug = normalizeSlug(request.getSlug());

        if (categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("Ya existe una categoría con el slug: " + slug);
        }

        Category category = new Category();
        applyRequest(category, request, slug);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(Long id, CategoryRequest request) {
        Category category = findById(id);
        String slug = normalizeSlug(request.getSlug());

        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new ConflictException("Ya existe otra categoría con el slug: " + slug);
        }

        applyRequest(category, request, slug);
        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = findById(id);
        try {
            categoryRepository.delete(category);
            categoryRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("No se puede eliminar la categoría porque tiene productos asociados.");
        }
    }

    private String normalizeSlug(String slug) {
        return slug.trim().toLowerCase();
    }

    private void applyRequest(Category category, CategoryRequest request, String slug) {
        category.setSlug(slug);
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
    }
}