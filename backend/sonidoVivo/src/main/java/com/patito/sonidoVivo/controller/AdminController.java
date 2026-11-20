package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.usuario.UserCreateRequest;
import com.patito.sonidoVivo.dto.usuario.UserResponse;
import com.patito.sonidoVivo.dto.usuario.UserUpdateRequest;
import com.patito.sonidoVivo.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Panel Admin Usuarios", description = "Gestión CRUD de usuarios (solo ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios")
    public List<UserResponse> list() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public UserResponse get(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo usuario")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o correo/usuario ya registrado")
    public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un usuario")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o acción no permitida")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public UserResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return userService.update(id, request, Long.valueOf(jwt.getSubject()));
    }
}
