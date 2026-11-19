package com.patito.sonidoVivo.config;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.patito.sonidoVivo.controller.AdminController;
import com.patito.sonidoVivo.controller.OrderController;
import com.patito.sonidoVivo.controller.StaffOrderController;
import com.patito.sonidoVivo.service.OrderService;
import com.patito.sonidoVivo.service.UserService;

@WebMvcTest(controllers = { AdminController.class, OrderController.class, StaffOrderController.class })
@Import({ SecurityConfig.class, SecurityConfigTest.JwtTestConfiguration.class })
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void configureJwtDecoder() {
        when(jwtDecoder.decode(anyString())).thenThrow(new BadJwtException("Token inválido o vencido"));
        when(jwtDecoder.decode(eq("customer-token"))).thenReturn(jwt("CUSTOMER"));
        when(jwtDecoder.decode(eq("seller-token"))).thenReturn(jwt("SELLER"));
        when(jwtDecoder.decode(eq("admin-token"))).thenReturn(jwt("ADMIN"));
    }

    @Test
    void adminEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void adminEndpointRejectsCustomerRole() throws Exception {
        mockMvc.perform(get("/api/admin").header("Authorization", "Bearer customer-token"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void adminEndpointRejectsSellerRole() throws Exception {
        mockMvc.perform(get("/api/admin").header("Authorization", "Bearer seller-token"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void adminEndpointAllowsAdminRole() throws Exception {
        when(userService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin").header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void invalidOrExpiredTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin").header("Authorization", "Bearer expired-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void publicProductRouteDoesNotRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/products/security-test")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void customerCanAccessOwnOrdersButNotStaffOrderRoutes() throws Exception {
        when(orderService.findMine("7")).thenReturn(List.of());

        mockMvc.perform(get("/api/orders/mine").header("Authorization", "Bearer customer-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        mockMvc.perform(get("/api/staff/orders").header("Authorization", "Bearer customer-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void sellerCanAccessStaffOrderRoutesButCannotCreateCustomerOrder() throws Exception {
        when(orderService.findAllForStaff()).thenReturn(List.of());

        mockMvc.perform(get("/api/staff/orders").header("Authorization", "Bearer seller-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        mockMvc.perform(post("/api/orders").header("Authorization", "Bearer seller-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    private static Jwt jwt(String role) {
        Instant now = Instant.now();
        return Jwt.withTokenValue(role.toLowerCase() + "-token")
                .header("alg", "none")
                .subject("7")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(60))
                .claim("roles", List.of(role))
                .build();
    }

    @TestConfiguration
    static class JwtTestConfiguration {

        @Bean
        JwtAuthenticationConverter jwtAuthenticationConverter() {
            JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
            authorities.setAuthoritiesClaimName("roles");
            authorities.setAuthorityPrefix("ROLE_");

            JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
            converter.setJwtGrantedAuthoritiesConverter(authorities);
            return converter;
        }
    }
}
