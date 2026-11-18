package com.patito.sonidoVivo.service;


import com.patito.sonidoVivo.dto.usuario.UserCreateRequest;
import com.patito.sonidoVivo.dto.usuario.UserResponse;
import com.patito.sonidoVivo.dto.usuario.UserUpdateRequest;
import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service 
@RequiredArgsConstructor 
public class UserService {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return users.findAll(Sort.by("id")).stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.from(getOrThrow(id));
    }

    @Transactional
    public UserResponse create(UserCreateRequest r) {
        return UserResponse.from(createUser(r.name(), r.phone(), r.email(), r.password(), r.role()));
    }

    @Transactional
    public User createUser(String name, String phone, String email, String password, Role role) {
        String normalized = email.trim().toLowerCase();
        if (users.existsByEmail(normalized)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado");
        }
        User u = new User();
        u.setName(name);
        u.setPhone(phone);
        u.setEmail(normalized);
        u.setPasswordHash(encoder.encode(password));
        u.setRole(role);
        u.setActive(true);
        return users.saveAndFlush(u);  
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest r, Long currentUserId) {
        User u = getOrThrow(id);

        if (id.equals(currentUserId) && (r.role() != Role.ADMIN || !r.active())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No puedes quitarte el rol de admin ni desactivar tu propia cuenta");
        }

        String email = r.email().trim().toLowerCase();
        if (users.existsByEmailAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado");
        }

        u.setName(r.name());
        u.setPhone(r.phone());
        u.setEmail(email);
        u.setRole(r.role());
        u.setActive(r.active());
        return UserResponse.from(users.saveAndFlush(u));
    }

    private User getOrThrow(Long id) {
        return users.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }
}

