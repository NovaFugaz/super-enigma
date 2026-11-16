package com.patito.sonidoVivo.dto.setting;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class LowStockThresholdRequest {
    
    @NotNull(message = "El umbral de stock bajo es obligatio.")
    @Min(value = 0, message = "El umbral de stock bajo debe ser mayor o igual a 0.")
    private Integer threshold;
}
