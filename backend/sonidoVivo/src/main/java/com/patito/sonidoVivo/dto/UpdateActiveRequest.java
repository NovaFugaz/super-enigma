package com.patito.sonidoVivo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema
public class UpdateActiveRequest
{
    @NotNull(message = "Indica si la cuenta debe quedar activa.")
    private Boolean active;
}