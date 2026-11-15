package com.patito.sonidoVivo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patito.sonidoVivo.model.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Location> findByActiveTrue();
}