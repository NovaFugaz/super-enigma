package com.patito.sonidoVivo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patito.sonidoVivo.model.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {

}
