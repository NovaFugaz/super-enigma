package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.location.LocationResponse;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.service.LocationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor 
@Tag(name = "Ubicaciones", description = "Operaciones relacionadas con las ubicaciones geográficas del sistema.")
public class LocationController {

    private final LocationService locationService;

    @GetMapping 
    @Operation(summary = "Listar ubicaciones por tipo", description = "Obtiene el listado de ubicaciones filtradas según su tipo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de ubicaciones obtenida con éxito"),
            @ApiResponse(responseCode = "400", description = "Tipo de ubicación inválido o parámetro faltante"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public List<LocationResponse> list(
            @Parameter(description = "Tipo de ubicación a consultar", required = true)
            @RequestParam LocationType type
    ) {
        return locationService.list(type);
    }
}
