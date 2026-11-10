package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name = "subcripciones")
@Getter 
@Setter 
public class Subscriber {

    private Long id;
    private String email;
    private Boolean active = true;
    private LocalDateTime subscribedAt;
}
