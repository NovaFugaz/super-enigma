package com.patito.sonidoVivo.controller;

import com.patito.sonidoVivo.dto.usuario.UserCreateRequest;
import com.patito.sonidoVivo.dto.usuario.UserResponse;
import com.patito.sonidoVivo.dto.usuario.UserUpdateRequest;
import com.patito.sonidoVivo.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Panel Admin Usuarios", description = "Operaciones relacionadas al CRUD de los usuarios")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Obtiene una lista de todos los usuarios del sistema")
    public List<UserResponse> list() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene un usuario por su id")
    public UserResponse get(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crea un nuevo usuario")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualiza un usuario por su id")
    public UserResponse update(@PathVariable Long id,
                               @Valid @RequestBody UserUpdateRequest request,
                               @AuthenticationPrincipal Jwt jwt) {
        return userService.update(id, request, Long.valueOf(jwt.getSubject()));
    }
}
