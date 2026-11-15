package com.patito.sonidoVivo.mapper;

import java.util.Locale;

import org.springframework.stereotype.Component;

import com.patito.sonidoVivo.dto.UserResponse;
import com.patito.sonidoVivo.model.User;

@Component
public class UserMapper {

    public UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setName(u.getUsername());
        r.setPhone(u.getPhone());
        r.setEmail(u.getEmail());
        r.setRole(u.getRol().name().toLowerCase(Locale.ROOT));
        r.setActive(u.getActive());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}