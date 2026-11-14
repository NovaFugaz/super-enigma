package com.patito.sonidoVivo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.patito.sonidoVivo.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCode(String code);

    @EntityGraph(attributePaths = "category")
    Optional<Product> findByCodeAndActiveTrue(String code);

    @Override
    @EntityGraph(attributePaths = "category")
    List<Product> findAll();

    @EntityGraph(attributePaths = "category")
    List<Product> findByActiveTrue();

    @EntityGraph(attributePaths = "category")
    List<Product> findByActiveTrueAndCategoryId(Long categoryId);

    @EntityGraph(attributePaths = "category")
    List<Product> findByActiveTrueAndCategorySlug(String slug);

    @EntityGraph(attributePaths = "category")
    List<Product> findByActiveTrueAndFeaturedTrue();
}