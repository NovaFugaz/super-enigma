package com.patito.sonidoVivo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.patito.sonidoVivo.dto.CreateUserRequest;
import com.patito.sonidoVivo.dto.PageResponse;
import com.patito.sonidoVivo.dto.UpdateUserRequest;
import com.patito.sonidoVivo.dto.UserResponse;
import com.patito.sonidoVivo.enums.UserRole;
import com.patito.sonidoVivo.exception.BadRequestException;
import com.patito.sonidoVivo.exception.ResourceNotFoundException;
import com.patito.sonidoVivo.exception.UserAlreadyExistsException;
import com.patito.sonidoVivo.mapper.UserMapper;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.UserRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int MAX_PAGE_SIZE = 100;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> search(String q, String role, Boolean active, int page, int size) {
        UserRole roleFilter = (role == null || role.isBlank()) ? null : parseRole(role);
        String text = (q == null) ? "" : q.trim().toLowerCase(Locale.ROOT);

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!text.isEmpty()) {
                String pattern = "%" + text + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)));
            }
            if (roleFilter != null) {
                predicates.add(cb.equal(root.get("rol"), roleFilter));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.ASC, "id"));

        Page<User> result = userRepository.findAll(spec, pageable);
        List<UserResponse> content = result.getContent().stream().map(userMapper::toResponse).toList();
        return new PageResponse<>(content, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUser(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(email);
        }

        User user = new User();
        user.setUsername(request.getName().trim());
        user.setPhone(request.getPhone());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRol(parseRole(request.getRole()));
        user.setActive(true);

        try {
            return userMapper.toResponse(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException e) {
            throw new UserAlreadyExistsException(email);
        }
    }

    @Transactional
    public UserResponse update(Long actorId, Long id, UpdateUserRequest request) {
        User user = getUser(id);
        UserRole newRole = parseRole(request.getRole());
        String email = normalizeEmail(request.getEmail());

        if (id.equals(actorId) && newRole != user.getRol()) {
            throw new BadRequestException("No puedes cambiar tu propio rol desde esta sesión.");
        }
        if (newRole != UserRole.ADMIN && isLastActiveAdmin(user)) {
            throw new BadRequestException("Debe permanecer al menos un administrador activo.");
        }
        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new UserAlreadyExistsException(email);
        }

        user.setUsername(request.getName().trim());
        user.setPhone(request.getPhone());
        user.setEmail(email);
        user.setRol(newRole);

        try {
            return userMapper.toResponse(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException e) {
            throw new UserAlreadyExistsException(email);
        }
    }

    @Transactional
    public UserResponse setActive(Long actorId, Long id, boolean active) {
        User user = getUser(id);

        if (!active) {
            if (id.equals(actorId)) {
                throw new BadRequestException("No puedes desactivar tu propia cuenta desde esta sesión.");
            }
            if (isLastActiveAdmin(user)) {
                throw new BadRequestException("Debe permanecer al menos un administrador activo.");
            }
        }

        user.setActive(active);
        return userMapper.toResponse(userRepository.save(user));
    }

    private boolean isLastActiveAdmin(User user) {
        return user.getRol() == UserRole.ADMIN
                && Boolean.TRUE.equals(user.getActive())
                && userRepository.countByRolAndActiveTrue(UserRole.ADMIN) <= 1;
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("El rol debe ser customer, seller o admin.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}