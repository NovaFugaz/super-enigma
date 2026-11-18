package com.patito.sonidoVivo.exception;

import com.patito.sonidoVivo.dto.common.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex,
                                               HttpServletRequest req) {
        Map<String, String> details = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> details.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, "Hay campos inválidos", req, details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException ex,
                                               HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST,
                "JSON mal formado o valor no permitido (los roles y estados van en minúscula)",
                req, null);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> status(ResponseStatusException ex, HttpServletRequest req) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return build(status, ex.getReason(), req, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integrity(DataIntegrityViolationException ex,
                                              HttpServletRequest req) {
        return build(HttpStatus.CONFLICT,
                "El registro viola una restricción (dato duplicado o en uso)", req, null);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message,
                                           HttpServletRequest req, Map<String, String> details) {
        return ResponseEntity.status(status)
                .body(ApiError.of(status, message, req.getRequestURI(), details));
    }
}