package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserStatusRequest {
    @NotNull(message = "El estado activo es obligatorio")
    @Schema(description = "Cuenta del usuario se encuentra activa y habilitada.",example = "true")
    private Boolean active;
}
