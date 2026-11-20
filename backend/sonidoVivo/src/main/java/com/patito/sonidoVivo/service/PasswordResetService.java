package com.patito.sonidoVivo.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.model.PasswordResetToken;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.PasswordResetTokenRepository;
import com.patito.sonidoVivo.repository.UserRepository;

@Service
public class PasswordResetService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetService.class);
    private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(15);
    private static final Duration REQUEST_COOLDOWN = Duration.ofMinutes(1);
    private static final String GENERIC_MESSAGE =
            "Si la cuenta existe y está activa, recibirás un correo con instrucciones para restablecer la contraseña. "
                    + "Si no aparece en Mailpit, verifica que los contenedores estén iniciados e inténtalo nuevamente.";

    private final UserRepository users;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String frontendUrl;

    public PasswordResetService(
            UserRepository users,
            PasswordResetTokenRepository resetTokens,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            @Value("${app.frontend-url}") String frontendUrl) {
        this.users = users;
        this.resetTokens = resetTokens;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Transactional
    public String requestReset(String email) {
        User user = users.findByEmail(email.trim().toLowerCase())
                .filter(User::isActive)
                .orElse(null);
        if (user == null) return GENERIC_MESSAGE;

        Instant now = Instant.now();
        boolean isCoolingDown = resetTokens.findTopByUser_IdOrderByCreatedAtDesc(user.getId())
                .map(lastToken -> lastToken.getCreatedAt().isAfter(now.minus(REQUEST_COOLDOWN)))
                .orElse(false);
        if (isCoolingDown) return GENERIC_MESSAGE;

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        resetTokens.deleteAllByUser_Id(user.getId());
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setExpiresAt(now.plus(TOKEN_LIFETIME));
        resetTokens.save(resetToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Restablece tu contraseña de Sonido Vivo");
        message.setText("""
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.

                Abre este enlace dentro de los próximos 15 minutos:
                %s/recuperar?token=%s

                Si no solicitaste este cambio, puedes ignorar este mensaje.
                """.formatted(frontendUrl, rawToken));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            resetTokens.delete(resetToken);
            LOGGER.error("No se pudo enviar el correo de restablecimiento de contraseña", exception);
        }

        return GENERIC_MESSAGE;
    }

    @Transactional
    public void confirmReset(String rawToken, String newPassword) {
        PasswordResetToken token = resetTokens.findByTokenHashForUpdate(hashToken(rawToken))
                .filter(found -> found.getUsedAt() == null)
                .filter(found -> found.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "El enlace no es válido o expiró. Solicita uno nuevo."));

        if (!token.getUser().isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "El enlace no es válido o expiró. Solicita uno nuevo.");
        }

        token.getUser().setPasswordHash(passwordEncoder.encode(newPassword));
        token.setUsedAt(Instant.now());
        resetTokens.save(token);
    }

    private static String hashToken(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible", exception);
        }
    }
}
