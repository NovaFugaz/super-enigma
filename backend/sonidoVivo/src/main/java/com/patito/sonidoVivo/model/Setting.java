package com.patito.sonidoVivo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name = "configuraciones")
@Getter 
@Setter 
public class Setting {

    private String key;
    private String value;
}
