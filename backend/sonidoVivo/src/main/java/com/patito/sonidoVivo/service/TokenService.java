package com.patito.sonidoVivo.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.patito.sonidoVivo.model.User;

@Service
public class TokenService {
    private final JwtEncoder encoder;
    private final String issuer;
    private final long expirationMinutes;

    public TokenService(JwtEncoder encoder,
            @Value("${app.jwt.issuer}") String issuer,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.encoder = encoder;
        this.issuer = issuer;
        this.expirationMinutes = expirationMinutes;
    }

    public String generate(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plus(expirationMinutes, ChronoUnit.MINUTES))
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("roles", List.of(user.getRole().name()))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long expiresInMs() {
        return expirationMinutes * 60_000;
    }
}