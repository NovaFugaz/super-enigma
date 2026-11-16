package com.patito.sonidoVivo.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.dto.auth.PageResponse;
import com.patito.sonidoVivo.dto.auth.UserAdminRequest;
import com.patito.sonidoVivo.dto.auth.UserResponse;
import com.patito.sonidoVivo.enums.UserRole;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public static UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getPhone(), u.getEmail(),
                u.getRol().name(), u.getActive(), u.getCreatedAt());
    }

    public PageResponse<UserResponse> list(String q, UserRole role, Boolean active, int page) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), 10, Sort.by("id").descending());
        return PageResponse.of(userRepository.search(q, role, active, pageable).map(UserService::toResponse));
    }

    public UserResponse get(Long id) {
        return toResponse(find(id));
    }

    public UserResponse create(UserAdminRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña es obligatoria.");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
        }

        User user = new User();
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        apply(user, request);
        return toResponse(userRepository.save(user));
    }

    public UserResponse update(Long id, UserAdminRequest request) {
        User user = find(id);

        String email = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
        }

        apply(user, request);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(userRepository.save(user));
    }

    public UserResponse setActive(Long id, Boolean active) {
        User user = find(id);
        user.setActive(active);
        return toResponse(userRepository.save(user));
    }

    private void apply(User user, UserAdminRequest request) {
        user.setUsername(request.getName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone());
        user.setRol(request.getRole());
        user.setActive(request.getActive());
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
    }
}