package com.patito.sonidoVivo.dto.common;

import org.springframework.http.HttpStatus;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.Map;

@Schema(title = "Api Error",
        description = "Estructura estándar de respuesta cuando ocurre un error en la API")
public record ApiError(

        @Schema(description = "Marca de tiempo en formato UTC (ISO-8601) en que ocurrió el error",
                example = "2026-11-19T13:54:00Z")
        Instant timestamp,

        @Schema(description = "Código de estado HTTP numérico",example = "400")
        int status,

        @Schema(description = "Nombre estándar del estado HTTP",example = "Bad Request")
        String error,

        @Schema(description = "Mensaje general describiendo el motivo del error",
                example = "Error de validación en los datos enviados")
        String message,

        @Schema(description = "Ruta del endpoint donde se originó el error",
                example = "/api/v1/products")
        String path,
        Map<String, String> details 
) {
    public static ApiError of(HttpStatus status, String message, String path,
                              Map<String, String> details) {
        return new ApiError(Instant.now(), status.value(),
                status.getReasonPhrase(), message, path, details);
    }
}