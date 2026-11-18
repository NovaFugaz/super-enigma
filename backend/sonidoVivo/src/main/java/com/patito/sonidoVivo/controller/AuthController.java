package com.patito.sonidoVivo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.auth.AuthResponse;
import com.patito.sonidoVivo.dto.auth.LoginRequest;
import com.patito.sonidoVivo.dto.auth.RegisterRequest;
import com.patito.sonidoVivo.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/auth")
@RequiredArgsConstructor 
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse login(@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }
}
