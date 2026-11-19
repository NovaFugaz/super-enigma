package com.patito.sonidoVivo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patito.sonidoVivo.model.Location;

public interface LocationRepository extends JpaRepository<Location, String> {
}
