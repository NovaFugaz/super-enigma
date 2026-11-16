package com.patito.sonidoVivo.config;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

        private static final String[] SWAGGER_WHITELIST = {
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**"
        };

        @Value("${app.cors.allowed-origins}")
        private List<String> allowedOrigins;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationConverter converter)
                        throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(Customizer.withDefaults())
                                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(a -> a
                                                .requestMatchers("/error").permitAll()
                                                .requestMatchers(SWAGGER_WHITELIST).permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/auth/login",
                                                                "/api/auth/register",
                                                                "/api/auth/forgot-password", "/api/auth/reset-password",
                                                                "/api/newsletter/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/products/**",
                                                                "/api/categories/**")
                                                .permitAll()
                                                .requestMatchers("/api/admin/**", "/api/users/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/settings/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())
                                .oauth2ResourceServer(o -> o
                                                .jwt(j -> j.jwtAuthenticationConverter(converter))
                                                .authenticationEntryPoint((request, response, ex) -> writeJson(response,
                                                                HttpServletResponse.SC_UNAUTHORIZED,
                                                                "Debes iniciar sesión para realizar esta acción."))
                                                .accessDeniedHandler((request, response, ex) -> writeJson(response,
                                                                HttpServletResponse.SC_FORBIDDEN,
                                                                "No tienes permisos para realizar esta acción.")));
                return http.build();
        }

        private static void writeJson(HttpServletResponse response, int status, String message) throws IOException {
                response.setStatus(status);
                response.setCharacterEncoding("UTF-8");
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"" + message + "\"}");
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(allowedOrigins);
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setMaxAge(3600L);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}