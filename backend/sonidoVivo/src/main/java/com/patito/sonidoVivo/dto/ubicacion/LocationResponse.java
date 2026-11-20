package com.patito.sonidoVivo.dto.ubicacion;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import com.patito.sonidoVivo.model.Location;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Location Response", description = "Representa la información de una sucursal, tienda o punto de retiro")
public record LocationResponse(
        @Schema(description = "Identificador único de la ubicación", 
                example = "retiro-centro")
        String id,

        @Schema(description = "Tipo de ubicación", example = "pickup")
        String type,

        @Schema(description = "Nombre comercial de la sucursal o punto de retiro", example = "Starken Viña Batuco")
        String name,

        @Schema(description = "Dirección física completa de la ubicación", example = "Av. Valparaíso 1195, Viña del Mar, Valparaíso")
        String address,

        @Schema(description = "Coordenadas geográficas en formato [latitud, longitud]", example = "[-33.0259, -71.5449]")
        List<BigDecimal> position,

        @Schema(description = "Listado de horarios de atención por tramo o día", 
                example = "[\"Lunes a Viernes: 09:00 - 18:30 hrs\", \"Sábados: 09:00 - 13:00\", \"Domingo y festivos: Cerrado\"]")
        List<String> hours,

        @Schema(description = "Observaciones o indicaciones adicionales para llegar o retirar", example = "Retiro de pedidos Starken", nullable = true)
        String note) {

        public static LocationResponse from(Location l) {
                List<String> hours = (l.getHours() == null || l.getHours().isBlank())
                                ? List.of()
                                : Arrays.stream(l.getHours().split("\\R"))
                                                .map(String::trim)
                                                .filter(line -> !line.isEmpty())
                                                .toList();

                return new LocationResponse(
                                l.getId(),
                                l.getType().name().toLowerCase(),
                                l.getName(),
                                l.getAddress(),
                                List.of(l.getLatitude(), l.getLongitude()),
                                hours,
                                l.getNote());
        }
}