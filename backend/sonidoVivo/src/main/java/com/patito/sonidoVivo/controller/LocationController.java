package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.ubicacion.LocationResponse;
import com.patito.sonidoVivo.service.LocationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/locations")
@RequiredArgsConstructor 
@Tag(name = "Ubicaciones", description = "Tienda y puntos de retiro")
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    @Operation(summary = "Listar ubicaciones",
            description = "Devuelve la tienda y los puntos de retiro. Se puede filtrar por tipo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ubicaciones obtenidas",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = LocationResponse.class)))),
            @ApiResponse(responseCode = "400", description = "Tipo no válido", content = @Content)
    })
    public List<LocationResponse> list(
            @Parameter(description = "store o pickup. Sin valor devuelve todas.", example = "pickup")
            @RequestParam(required = false) String type) {
        return locationService.list(type);
    }
}