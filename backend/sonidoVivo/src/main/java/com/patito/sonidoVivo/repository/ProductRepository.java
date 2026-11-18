package com.patito.sonidoVivo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.patito.sonidoVivo.model.Product;

public interface ProductRepository extends JpaRepository<Product, String> {

    
    List<Product> findAllByActiveTrueOrderByNameAsc();

    List<Product> findAllByCategory_SlugAndActiveTrueOrderByNameAsc(String slug);

}
