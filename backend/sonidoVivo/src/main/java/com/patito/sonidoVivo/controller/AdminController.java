package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.patito.sonidoVivo.dto.usuario.UserCreateRequest;
import com.patito.sonidoVivo.dto.usuario.UserResponse;
import com.patito.sonidoVivo.dto.usuario.UserUpdateRequest;
import com.patito.sonidoVivo.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Panel Admin Usuarios", description = "Operaciones CRUD para la gestión de usuarios.")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @Operation(summary = "Listar todos los usuarios", description = "Obtiene una lista completa de todos los usuarios registrados en el sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida exitosamente", 
                content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = UserResponse.class)))),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN)", content = @Content)
    })
    @GetMapping
    public List<UserResponse> list() {
        return userService.findAll();
    }

    @Operation(summary = "Obtener usuario por ID", description = "Devuelve los datos detallados de un usuario específico según su identificador único.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN)", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public UserResponse get(
            @Parameter(description = "ID único del usuario", required = true, example = "1") @PathVariable Long id) {
        return userService.findById(id);
    }

    @Operation(summary = "Crear un nuevo usuario", description = "Permite a un administrador registrar un nuevo usuario asignándole sus datos y rol correspondiente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente", 
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o correo/usuario ya registrado", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN)", content = @Content)
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request);
    }

    @Operation(summary = "Actualizar un usuario", description = "Modifica los datos de un usuario existente identificado por su ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente", 
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos de actualización inválidos o acción no permitida sobre el propio usuario", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN)", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    @PutMapping("/{id}")
    public UserResponse update(
            @Parameter(description = "ID único del usuario a actualizar", required = true, example = "1") @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return userService.update(id, request, Long.valueOf(jwt.getSubject()));
    }
}
