package com.patito.sonidoVivo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import com.patito.sonidoVivo.model.Product;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

  @Query("select p from Product p join fetch p.category where p.code = :code")
  Optional<Product> findWithCategory(@Param("code") String code);

  @Query("""
      select p from Product p join fetch p.category c
      where p.active = true
        and (:category = '' or c.slug = :category)
      order by p.name
      """)
  List<Product> findActive(@Param("category") String category);

  @Query("""
      select p from Product p join fetch p.category
      where (:brand = '' or lower(coalesce(p.brand, '')) like concat('%', :brand, '%'))
        and (:model = '' or lower(coalesce(p.model, '')) like concat('%', :model, '%'))
        and (:code = '' or lower(p.code) like concat('%', :code, '%'))
        and (:includeInactive = true or p.active = true)
      order by p.name
      """)
  List<Product> searchStaff(@Param("brand") String brand,
      @Param("model") String model,
      @Param("code") String code,
      @Param("includeInactive") boolean includeInactive);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Product p where p.code = :code")
  Optional<Product> findByCodeForUpdate(@Param("code") String code);

  List<Product> findAllByActiveTrueOrderByNameAsc();

  List<Product> findAllByCategory_SlugAndActiveTrueOrderByNameAsc(String slug);
}
