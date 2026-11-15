package com.patito.sonidoVivo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.patito.sonidoVivo.enums.UserRole;
import com.patito.sonidoVivo.model.User;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    Optional<User> findByResetTokenHash(String resetTokenHash);
    long countByRolAndActiveTrue(UserRole rol);
}