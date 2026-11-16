package com.patito.sonidoVivo.service;

import org.springframework.stereotype.Service;

import com.patito.sonidoVivo.dto.setting.LowStockThresholdResponse;
import com.patito.sonidoVivo.model.Setting;
import com.patito.sonidoVivo.repository.SettingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SettingService {

    private static final String LOW_STOCK_KEY = "low_stock_threshold";
    private static final int DEFAULT_THRESHOLD = 5;

    private final SettingRepository settingRepository;

    public LowStockThresholdResponse getLowStockThreshold() {
        int value = settingRepository.findById(LOW_STOCK_KEY)
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(DEFAULT_THRESHOLD); 

        return toResponse(value);
    }

    public LowStockThresholdResponse updateLowStockThreshold(Integer threshold) {
        Setting setting = new Setting();
        setting.setKey(LOW_STOCK_KEY);
        setting.setValue(String.valueOf(threshold));
        settingRepository.save(setting); 

        return toResponse(threshold);
    }

    private LowStockThresholdResponse toResponse(int value) {
        LowStockThresholdResponse response = new LowStockThresholdResponse();
        response.setKey(LOW_STOCK_KEY);
        response.setValue(value);
        return response;
    }
}
