package com.patito.sonidoVivo.dto.common;

import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> details 
) {
    public static ApiError of(HttpStatus status, String message, String path,
                              Map<String, String> details) {
        return new ApiError(Instant.now(), status.value(),
                status.getReasonPhrase(), message, path, details);
    }
}