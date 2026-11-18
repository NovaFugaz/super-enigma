package com.patito.sonidoVivo.repository;

import com.patito.sonidoVivo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

    @Query("""
            select p from Product p join fetch p.category c
            where (:category = '' or c.slug = :category)
              and (:q = '' or lower(p.name) like concat('%', :q, '%')
                           or lower(coalesce(p.brand, '')) like concat('%', :q, '%')
                           or lower(coalesce(p.model, '')) like concat('%', :q, '%')
                           or lower(p.code) like concat('%', :q, '%'))
              and (:includeInactive = true or p.active = true)
            order by p.name
            """)
    List<Product> search(@Param("category") String category,
                         @Param("q") String q,
                         @Param("includeInactive") boolean includeInactive);

    @Query("select p from Product p join fetch p.category where p.code = :code")
    Optional<Product> findWithCategory(@Param("code") String code);
}
