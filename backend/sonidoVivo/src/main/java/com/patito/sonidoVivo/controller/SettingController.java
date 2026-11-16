package com.patito.sonidoVivo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.setting.LowStockThresholdRequest;
import com.patito.sonidoVivo.dto.setting.LowStockThresholdResponse;
import com.patito.sonidoVivo.service.SettingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Configuraciones", description = "Operaciones relacionadas con los parámetros globales del sistema.")
public class SettingController {

    private final SettingService settingService;

    @GetMapping("/low-stock-threshold")
    @Operation(
            summary = "Obtener umbral de bajo stock",
            description = "Devuelve el valor mínimo configurado para alertar sobre bajo inventario",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Configuración obtenida con éxito"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para acceder a esta configuración"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public LowStockThresholdResponse get() {
        return settingService.getLowStockThreshold();
    }

    @PutMapping("/low-stock-threshold")
    @Operation(
            summary = "Actualizar umbral de bajo stock",
            description = "Modifica el valor mínimo de inventario para generar alertas de bajo stock",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Umbral actualizado con éxito"),
            @ApiResponse(responseCode = "400", description = "Valor de umbral inválido"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para modificar esta configuración"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public LowStockThresholdResponse update(@Valid @RequestBody LowStockThresholdRequest request) {
        return settingService.updateLowStockThreshold(request.getThreshold());
    }
}
