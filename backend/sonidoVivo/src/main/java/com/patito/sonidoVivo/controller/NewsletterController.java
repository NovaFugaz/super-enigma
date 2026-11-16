package com.patito.sonidoVivo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.subscription.NewsletterResponse;
import com.patito.sonidoVivo.dto.subscription.NewsletterSubscribeRequest;
import com.patito.sonidoVivo.dto.subscription.NewsletterUnsubscribeRequest;
import com.patito.sonidoVivo.service.NewsletterService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor 
public class NewsletterController {
    private final NewsletterService newsletterService;

    @PostMapping("/subscribe")
    public NewsletterResponse subscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
        return newsletterService.subscribe(request.getEmail());
    }

    @PostMapping("/unsubscribe")
    public NewsletterResponse unsubscribe(@Valid @RequestBody NewsletterUnsubscribeRequest request) {
        return newsletterService.unsubscribe(request.getToken());
    }
}
