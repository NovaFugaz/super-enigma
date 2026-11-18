package com.patito.sonidoVivo.controller;

import com.patito.sonidoVivo.dto.usuario.UserCreateRequest;
import com.patito.sonidoVivo.dto.usuario.UserResponse;
import com.patito.sonidoVivo.dto.usuario.UserUpdateRequest;
import com.patito.sonidoVivo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> list() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id,
                               @Valid @RequestBody UserUpdateRequest request,
                               @AuthenticationPrincipal Jwt jwt) {
        return userService.update(id, request, Long.valueOf(jwt.getSubject()));
    }
}
