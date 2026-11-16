package com.patito.sonidoVivo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.auth.AuthResponse;
import com.patito.sonidoVivo.dto.auth.ForgotPasswordRequest;
import com.patito.sonidoVivo.dto.auth.LoginRequest;
import com.patito.sonidoVivo.dto.auth.RegisterRequest;
import com.patito.sonidoVivo.dto.auth.ResetPasswordRequest;
import com.patito.sonidoVivo.dto.auth.UserResponse;
import com.patito.sonidoVivo.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Operaciones relacionadas con la autenticación de usuarios.")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un usuario", description = "Crear un nuevo usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado con éxito"),
            @ApiResponse(responseCode = "400", description = "Datos de registro inválidos"),
            @ApiResponse(responseCode = "409", description = "El correo ya está registrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso"),
            @ApiResponse(responseCode = "400", description = "Datos de login inválidos"),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil actual", description = "Devuelve los datos del usuario autenticado", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil obtenido con éxito"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public UserResponse me(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return authService.me(Long.valueOf(jwt.getSubject()));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Recuperar contraseña", description = "Envía instrucciones de recuperación al correo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud procesada con éxito"),
            @ApiResponse(responseCode = "400", description = "Correo electrónico inválido"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return Map.of("message", "Si el correo existe, te enviamos las instrucciones de recuperación.");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Actualiza la contraseña usando el token de recuperación")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contraseña actualizada con éxito"),
            @ApiResponse(responseCode = "400", description = "Token inválido, expirado o contraseña inválida"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return Map.of("message", "Contraseña actualizada correctamente.");
    }
}
