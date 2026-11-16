package com.patito.sonidoVivo.dto.location;

import com.patito.sonidoVivo.enums.Carrier;
import com.patito.sonidoVivo.enums.LocationType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class LocationResponse {
        private Long id;
        private String slug;
        private LocationType type;
        private Carrier carrier;
        private String name;
        private String address;
        private double latitude;
        private double longitude;
        private String hours;
        private String note;
}
