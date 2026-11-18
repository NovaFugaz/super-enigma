package com.patito.sonidoVivo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.repository.UserRepository;
import com.patito.sonidoVivo.service.UserService;

@Configuration
public class DatosDemo {

    @Bean
    CommandLineRunner cargar(UserRepository users, UserService userService) {
        return args -> {
            crear(users, userService, "Cliente Demo", "+56 9 1111 1111",
                    "cliente@sonidovivo.cl", "Cliente123!", Role.CUSTOMER);
            crear(users, userService, "Vendedor Demo", "+56 9 2222 2222",
                    "vendedor@sonidovivo.cl", "Vendedor123!", Role.SELLER);
            crear(users, userService, "Administrador Demo", "+56 9 3333 3333",
                    "admin@sonidovivo.cl", "Admin123!", Role.ADMIN);
        };
    }

    /** Solo crea la cuenta si el correo aún no existe, así no se duplica al reiniciar. */
    private void crear(UserRepository users, UserService userService, String name,
                       String phone, String email, String password, Role role) {
        if (users.existsByEmail(email)) return;
        userService.createUser(name, phone, email, password, role);
    }
}