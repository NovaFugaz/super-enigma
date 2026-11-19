package com.patito.sonidoVivo.dto.ubicacion;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.model.Location;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Location Response", description = "Representa la información de una sucursal, tienda o punto de retiro")
public record LocationResponse(
                @Schema(description = "Identificador único de la ubicación", example = "")
                String id,

                @Schema(description = "Tipo de ubicación según su función en la tienda", example = "STORE") 
                LocationType type,

                @Schema(description = "Nombre comercial de la sucursal o punto de retiro", example = "") 
                String name,

                @Schema(description = "Dirección física completa de la ubicación", example = "") 
                String address,

                @Schema(description = "Coordenadas geográficas en formato [latitud, longitud]", example = "[-xx.xxx, -xx.xxxx]") 
                List<BigDecimal> position,

                @Schema(description = "Listado de horarios de atención por tramo o día", example = "[\"\", \"\"]") 
                List<String> hours,

                @Schema(description = "Observaciones o indicaciones adicionales para llegar o retirar", example = "", nullable = true) 
                String note) {
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
