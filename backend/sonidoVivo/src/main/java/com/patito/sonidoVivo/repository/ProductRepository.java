package com.patito.sonidoVivo.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.patito.sonidoVivo.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    boolean existsByCode(String code);

    @EntityGraph(attributePaths = "category")
    Optional<Product> findByCode(String code);

    @EntityGraph(attributePaths = "category")
    Optional<Product> findByCodeAndActiveTrue(String code);

    @EntityGraph(attributePaths = "category")
    List<Product> findByCodeIn(Collection<String> codes);

    @EntityGraph(attributePaths = "category")
    List<Product> findByActiveTrueAndFeaturedTrueOrderByNameAsc();

    @Override
    @EntityGraph(attributePaths = "category")
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @Query("""
            select distinct p.brand from Product p
            where p.active = true and p.brand is not null
            order by p.brand
            """)
    List<String> findActiveBrands();

    @Query("""
            select distinct p.brand from Product p
            where p.active = true and p.brand is not null and p.category.slug = :slug
            order by p.brand
            """)
    List<String> findActiveBrandsByCategorySlug(@Param("slug") String slug);
}