package com.patito.sonidoVivo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.model.PasswordResetToken;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.PasswordResetTokenRepository;
import com.patito.sonidoVivo.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository users;

    @Mock
    private PasswordResetTokenRepository resetTokens;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JavaMailSender mailSender;

    private PasswordResetService passwordResetService;

    private User activeUser;

    @BeforeEach
    void setUp() {
        activeUser = new User();
        activeUser.setId(5L);
        activeUser.setName("Cliente Demo");
        activeUser.setEmail("cliente@example.cl");
        activeUser.setPasswordHash("old-hash");
        activeUser.setRole(Role.CUSTOMER);
        activeUser.setActive(true);
        passwordResetService = new PasswordResetService(
                users, resetTokens, passwordEncoder, mailSender, "http://localhost:5173");
    }

    @Test
    void sendsOneTimeTokenByEmailAndStoresOnlyItsHash() {
        when(users.findByEmail("cliente@example.cl")).thenReturn(Optional.of(activeUser));
        when(resetTokens.findTopByUser_IdOrderByCreatedAtDesc(5L)).thenReturn(Optional.empty());

        String response = passwordResetService.requestReset(" CLIENTE@example.cl ");

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        ArgumentCaptor<SimpleMailMessage> mailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(resetTokens).save(tokenCaptor.capture());
        verify(mailSender).send(mailCaptor.capture());

        String tokenHash = tokenCaptor.getValue().getTokenHash();
        Matcher tokenMatcher = Pattern.compile("token=([A-Za-z0-9_-]+)")
                .matcher(mailCaptor.getValue().getText());
        assertTrue(tokenMatcher.find());
        String rawToken = tokenMatcher.group(1);

        assertEquals(64, tokenHash.length());
        assertNotEquals(rawToken, tokenHash);
        assertEquals("cliente@example.cl", mailCaptor.getValue().getTo()[0]);
        assertTrue(tokenCaptor.getValue().getExpiresAt().isAfter(Instant.now().plusSeconds(14 * 60)));
        assertTrue(tokenCaptor.getValue().getExpiresAt().isBefore(Instant.now().plusSeconds(16 * 60)));
        assertTrue(response.startsWith("Si la cuenta existe"));
    }

    @Test
    void doesNotRevealWhetherEmailExists() {
        when(users.findByEmail("missing@example.cl")).thenReturn(Optional.empty());

        String response = passwordResetService.requestReset("missing@example.cl");

        assertTrue(response.startsWith("Si la cuenta existe"));
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
        verify(resetTokens, never()).save(any(PasswordResetToken.class));
    }

    @Test
    void doesNotRevealMailDeliveryFailuresAndAllowsRetry() {
        when(users.findByEmail("cliente@example.cl")).thenReturn(Optional.of(activeUser));
        when(resetTokens.findTopByUser_IdOrderByCreatedAtDesc(5L)).thenReturn(Optional.empty());
        org.mockito.Mockito.doThrow(new MailSendException("Mailpit is unavailable"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        String response = passwordResetService.requestReset("cliente@example.cl");

        assertTrue(response.startsWith("Si la cuenta existe"));
        verify(resetTokens).delete(any(PasswordResetToken.class));
    }

    @Test
    void changesPasswordAndMarksTokenUsed() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(activeUser);
        token.setExpiresAt(Instant.now().plusSeconds(60));
        when(resetTokens.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("new-hash");

        passwordResetService.confirmReset("valid-token", "NewPassword123!");

        assertEquals("new-hash", activeUser.getPasswordHash());
        assertTrue(token.getUsedAt() != null);
        verify(resetTokens).save(token);
        verify(resetTokens).findByTokenHashForUpdate(org.mockito.ArgumentMatchers.argThat(
                hash -> hash.length() == 64 && !hash.equals("valid-token")));

        assertThrows(ResponseStatusException.class,
                () -> passwordResetService.confirmReset("valid-token", "AnotherPassword123!"));
        verify(passwordEncoder, never()).encode("AnotherPassword123!");
    }

    @Test
    void rejectsExpiredTokensWithoutChangingPassword() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(activeUser);
        token.setExpiresAt(Instant.now().minusSeconds(1));
        when(resetTokens.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(token));

        assertThrows(ResponseStatusException.class,
                () -> passwordResetService.confirmReset("expired-token", "NewPassword123!"));

        assertEquals("old-hash", activeUser.getPasswordHash());
        verify(passwordEncoder, never()).encode(anyString());
    }
}
