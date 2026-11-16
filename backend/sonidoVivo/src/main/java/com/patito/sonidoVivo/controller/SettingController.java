package com.patito.sonidoVivo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.setting.LowStockThresholdRequest;
import com.patito.sonidoVivo.dto.setting.LowStockThresholdResponse;
import com.patito.sonidoVivo.service.SettingService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    @GetMapping("/low-stock-threshold")
    public LowStockThresholdResponse get() {
        return settingService.getLowStockThreshold();
    }

    @PutMapping("/low-stock-threshold")
    public LowStockThresholdResponse update(@Valid @RequestBody LowStockThresholdRequest request) {
        return settingService.updateLowStockThreshold(request.getThreshold());
    }
}
