package com.patito.sonidoVivo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.model.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByActiveTrue();
    List<Location> findByActiveTrueAndType(LocationType type);
}
