package com.patito.sonidoVivo.service;

import java.util.List;

import com.patito.sonidoVivo.model.Location;

import org.springframework.stereotype.Service;

import com.patito.sonidoVivo.dto.location.LocationResponse;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.repository.LocationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    public List<LocationResponse> list(LocationType type) {
        List<Location> locations = (type == null)
                ? locationRepository.findByActiveTrue()
                : locationRepository.findByActiveTrueAndType(type);

        return locations.stream().map(this::toResponse).toList();
    }

    private LocationResponse toResponse(Location l) {
        return new LocationResponse(l.getId(), l.getSlug(), l.getType(), l.getCarrier(),
                l.getName(), l.getAddress(), l.getLatitude(), l.getLongitude(),
                l.getHours(), l.getNote());
    }
}
