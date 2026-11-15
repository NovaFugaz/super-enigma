package com.patito.sonidoVivo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema
public class ProductActiveRequest
{
    @NotNull(message = "Indica si el producto debe quedar activo.")
    private Boolean active;
}