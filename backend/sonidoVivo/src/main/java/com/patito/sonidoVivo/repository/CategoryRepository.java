package com.patito.sonidoVivo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patito.sonidoVivo.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);

}
