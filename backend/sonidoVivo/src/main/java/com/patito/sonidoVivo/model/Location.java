package com.patito.sonidoVivo.model;

import com.patito.sonidoVivo.enums.Carrier;
import com.patito.sonidoVivo.enums.LocationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ubicaciones")
@Getter
@Setter
public class Location
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LocationType type;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private Carrier carrier;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 250)
    private String address;

    private double latitude;
    private double longitude;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String hours;

    @Column(length = 250)
    private String note;

    @Column(nullable = false)
    private Boolean active = true;

}