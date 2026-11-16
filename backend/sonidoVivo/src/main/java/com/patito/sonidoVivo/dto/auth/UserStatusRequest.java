package com.patito.sonidoVivo.dto.auth;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserStatusRequest {
    @NotNull(message = "El estado activo es obligatorio")
    private Boolean active;
}
