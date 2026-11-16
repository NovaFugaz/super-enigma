package com.patito.sonidoVivo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.auth.PageResponse;
import com.patito.sonidoVivo.dto.auth.UserAdminRequest;
import com.patito.sonidoVivo.dto.auth.UserResponse;
import com.patito.sonidoVivo.dto.auth.UserStatusRequest;
import com.patito.sonidoVivo.enums.UserRole;
import com.patito.sonidoVivo.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Operaciones administrativas para la gestión de usuarios.")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Obtiene una lista paginada de usuarios con filtros opcionales")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida con éxito"),
            @ApiResponse(responseCode = "400", description = "Parámetros de búsqueda inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para listar usuarios"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public PageResponse<UserResponse> list(
            @Parameter(description = "Texto de búsqueda por nombre o correo", example = "carlos")
            @RequestParam(defaultValue = "") String q,
            @Parameter(description = "Filtrar por rol de usuario")
            @RequestParam(required = false) UserRole role,
            @Parameter(description = "Filtrar por estado de cuenta (true = activa, false = inactiva)", example = "true")
            @RequestParam(required = false) Boolean active,
            @Parameter(description = "Número de página a consultar (comienza en 0)", example = "0")
            @RequestParam(defaultValue = "0") int page) {
        return userService.list(q, role, active, page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Devuelve los datos de un usuario específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado con éxito"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para ver el usuario"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public UserResponse get(
            @Parameter(description = "ID único del usuario", example = "1", required = true)
            @PathVariable Long id) {
        return userService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear usuario", description = "Crea un nuevo usuario desde el panel administrativo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario creado con éxito"),
            @ApiResponse(responseCode = "400", description = "Datos de usuario inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para crear usuarios"),
            @ApiResponse(responseCode = "409", description = "El correo ya está registrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public UserResponse create(@Valid @RequestBody UserAdminRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario", description = "Modifica los datos de un usuario existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario actualizado con éxito"),
            @ApiResponse(responseCode = "400", description = "Datos de actualización inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para actualizar usuarios"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "409", description = "El correo ya está en uso por otro usuario"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public UserResponse update(
            @Parameter(description = "ID único del usuario a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody UserAdminRequest request) {
        return userService.update(id, request);
    }

    @PatchMapping("/{id}/active")
    @Operation(summary = "Cambiar estado del usuario", description = "Activa o desactiva la cuenta de un usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado con éxito"),
            @ApiResponse(responseCode = "400", description = "Estado inválido o faltante"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token inválido"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para cambiar el estado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public UserResponse setActive(
            @Parameter(description = "ID único del usuario", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody UserStatusRequest request) {
        return userService.setActive(id, request.getActive());
    }
}
