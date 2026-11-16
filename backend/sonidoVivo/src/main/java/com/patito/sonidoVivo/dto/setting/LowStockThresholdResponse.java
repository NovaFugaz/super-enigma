package com.patito.sonidoVivo.dto.setting;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor  
public class LowStockThresholdResponse {
    private String key;
    private Integer value;
}
