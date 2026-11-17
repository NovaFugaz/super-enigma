package com.patito.sonidoVivo.dto.ubicacion;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.model.Location;

public record LocationResponse(
        String id,
        LocationType type,
        String name,
        String address,
        List<BigDecimal> position,
        List<String> hours,
        String note
) {
    public static LocationResponse from(Location l) {
        List<String> hours = (l.getHours() == null || l.getHours().isBlank())
                ? List.of()
                : Arrays.stream(l.getHours().split("\\R"))
                        .map(String::trim)
                        .filter(line -> !line.isEmpty())
                        .toList();

        return new LocationResponse(l.getId(), l.getType(), l.getName(), l.getAddress(),
                List.of(l.getLatitude(), l.getLongitude()), hours, l.getNote());
    }
}
