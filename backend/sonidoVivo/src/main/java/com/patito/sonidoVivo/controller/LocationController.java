package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.location.LocationResponse;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.service.LocationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor 
public class LocationController {

    private final LocationService locationService;

    @GetMapping 
    public List<LocationResponse> list(@RequestParam LocationType type) {
        return locationService.list(type);
    }
}
