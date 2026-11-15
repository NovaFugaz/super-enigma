package com.patito.sonidoVivo.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema
public class UserResponse
{
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String role;
    private Boolean active;
    private LocalDateTime createdAt;
}