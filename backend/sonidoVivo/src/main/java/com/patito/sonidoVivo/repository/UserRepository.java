package com.patito.sonidoVivo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.patito.sonidoVivo.enums.UserRole;
import com.patito.sonidoVivo.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetTokenHash(String resetTokenHash);

    @Query("""
        SELECT u FROM User u
        WHERE (LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:role IS NULL OR u.rol = :role)
          AND (:active IS NULL OR u.active = :active)
        """)
    Page<User> search(String q, UserRole role, Boolean active, Pageable pageable);
}
