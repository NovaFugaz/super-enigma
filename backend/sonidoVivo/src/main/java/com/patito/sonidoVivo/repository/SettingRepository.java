package com.patito.sonidoVivo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patito.sonidoVivo.model.Setting;

public interface SettingRepository extends JpaRepository<Setting, String> {

}
