package com.patito.sonidoVivo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.auth.AuthResponse;
import com.patito.sonidoVivo.dto.auth.LoginRequest;
import com.patito.sonidoVivo.dto.auth.PasswordResetConfirmRequest;
import com.patito.sonidoVivo.dto.auth.PasswordResetRequest;
import com.patito.sonidoVivo.dto.auth.PasswordResetResponse;
import com.patito.sonidoVivo.dto.auth.RegisterRequest;
import com.patito.sonidoVivo.service.AuthService;
import com.patito.sonidoVivo.service.PasswordResetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro e inicio de sesión de usuarios")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un nuevo usuario")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o usuario/correo ya registrado")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Iniciar sesión y obtener token JWT")
    @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Inicio de sesión exitoso"),
    @ApiResponse(responseCode = "400", description = "Formato de solicitud inválido"),
    @ApiResponse(responseCode = "401", description = "Credenciales incorrectas")})
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/password-reset/request")
    @Operation(summary = "Solicitar un enlace de restablecimiento de contraseña")
    public PasswordResetResponse requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        return new PasswordResetResponse(passwordResetService.requestReset(request.email()));
    }

    @PostMapping("/password-reset/confirm")
    @Operation(summary = "Confirmar una contraseña nueva usando un token de un solo uso")
    @ApiResponse(responseCode = "400", description = "El token no es válido o expiró")
    public PasswordResetResponse confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.confirmReset(request.token(), request.newPassword());
        return new PasswordResetResponse("La contraseña se restableció correctamente.");
    }
}
