package com.patito.sonidoVivo.service;

import java.util.List;

import java.util.Comparator;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.dto.ubicacion.LocationResponse;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.model.Location;
import com.patito.sonidoVivo.repository.LocationRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class LocationService {

    private final LocationRepository locations;

    @Transactional(readOnly = true)
    public List<LocationResponse> list(String type) {
        LocationType filter = parse(type);
        return locations.findAll().stream()
                .filter(l -> filter == null || l.getType() == filter)
                .sorted(Comparator.comparing(Location::getType).thenComparing(Location::getName))
                .map(LocationResponse::from)
                .toList();
    }
    
    private LocationType parse(String type) {
        if (type == null || type.isBlank()) return null;
        try {
            return LocationType.valueOf(type.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tipo no válido. Usa: store o pickup");
        }
    }
}