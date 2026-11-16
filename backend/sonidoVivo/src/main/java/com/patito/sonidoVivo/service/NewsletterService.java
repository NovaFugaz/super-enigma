package com.patito.sonidoVivo.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.dto.subscription.NewsletterResponse;
import com.patito.sonidoVivo.model.Subscriber;
import com.patito.sonidoVivo.repository.SubscriberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final SubscriberRepository subscriberRepository;

    public NewsletterResponse subscribe(String email) {
        String clean = email.trim().toLowerCase();

        Subscriber subscriber = subscriberRepository.findByEmail(clean).orElseGet(() -> {
            Subscriber s = new Subscriber();
            s.setEmail(clean);
            return s;
        });
        subscriber.setActive(true);
        subscriberRepository.save(subscriber);

        return new NewsletterResponse("¡Gracias por suscribirte!", clean, tokenFor(clean));
    }

    public NewsletterResponse unsubscribe(String token) {
        String email;
        try {
            email = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido.");
        }

        Subscriber subscriber = subscriberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Suscripción no encontrada."));
        subscriber.setActive(false);
        subscriberRepository.save(subscriber);

        return new NewsletterResponse("Te desuscribiste correctamente.", email, token);
    }

    private String tokenFor(String email) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(email.getBytes(StandardCharsets.UTF_8));
    }
}
