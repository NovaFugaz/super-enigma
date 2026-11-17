package com.patito.sonidoVivo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

import com.patito.sonidoVivo.enums.LocationType;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
public class Location {

    @Id
    @NotBlank(message = "El id es obligatorio")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
             message = "El id solo admite minúsculas, números y guiones")
    @Size(max = 40, message = "El id no puede superar los 40 caracteres")
    @Column(length = 40)
    private String id;

    @NotNull(message = "El tipo es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LocationType type;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
    @Column(nullable = false, length = 200)
    private String address;

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90.0", message = "Latitud fuera de rango")
    @DecimalMax(value = "90.0", message = "Latitud fuera de rango")
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180.0", message = "Longitud fuera de rango")
    @DecimalMax(value = "180.0", message = "Longitud fuera de rango")
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @Size(max = 500, message = "Los horarios no pueden superar los 500 caracteres")
    @Column(length = 500)
    private String hours;

    @Size(max = 255, message = "La nota no puede superar los 255 caracteres")
    private String note;
}