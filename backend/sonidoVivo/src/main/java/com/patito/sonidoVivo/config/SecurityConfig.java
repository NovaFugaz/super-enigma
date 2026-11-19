package com.patito.sonidoVivo.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
            JwtAuthenticationConverter jwtConverter) throws Exception {

        AuthenticationEntryPoint unauthorized = (req, res, ex) -> writeError(res, 401, "Unauthorized",
                "Token ausente, inválido o vencido");
        AccessDeniedHandler forbidden = (req, res, ex) -> writeError(res, 403, "Forbidden",
                "No tienes permiso para esta acción");

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // --- Público ---
                        .requestMatchers("/error", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/locations/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/tracking/**").permitAll()

                        // --- Cliente ---
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/orders/mine").hasRole("CUSTOMER")

                        // --- Staff: vendedor y admin ---
                        .requestMatchers(HttpMethod.GET, "/api/staff/products/**").hasAnyRole("SELLER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/staff/products/*/stock").hasAnyRole("SELLER", "ADMIN")
                        .requestMatchers("/api/staff/orders/**").hasAnyRole("SELLER", "ADMIN")

                        // --- Staff: solo admin (POST, PUT, DELETE de productos y lo demás) ---
                        .requestMatchers("/api/staff/**", "/api/users/**", "/api/reports/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Cualquier otro método sobre el catálogo público queda bloqueado.
                        .requestMatchers("/api/products/**", "/api/categories/**", "/api/locations/**").denyAll()

                        .anyRequest().authenticated())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(unauthorized)
                        .accessDeniedHandler(forbidden))
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter))
                        .authenticationEntryPoint(unauthorized)
                        .accessDeniedHandler(forbidden));

        return http.build();
    }

    /** Permite que React llame al backend. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
        // Lee la lista de orígenes permitidos desde application.properties
        // CORS es un mecanismo de seguridad que restringe las solicitudes HTTP entre dominios.
        // Lo estamos usando para que el front le pueda hacer llamadas al back, pero solo al front que se le permite.
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private static void writeError(HttpServletResponse res, int status, String error,
            String message) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"error\":\"" + error
                + "\",\"message\":\"" + message + "\"}");
    }
}