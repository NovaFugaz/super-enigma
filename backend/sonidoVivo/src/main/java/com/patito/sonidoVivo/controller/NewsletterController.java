package com.patito.sonidoVivo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.subscription.NewsletterResponse;
import com.patito.sonidoVivo.dto.subscription.NewsletterSubscribeRequest;
import com.patito.sonidoVivo.dto.subscription.NewsletterUnsubscribeRequest;
import com.patito.sonidoVivo.service.NewsletterService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor 
@Tag(name = "Newsletter", description = "Operaciones relacionadas con la suscripción y cancelación del boletín informativo.")
public class NewsletterController {

    private final NewsletterService newsletterService;

    @PostMapping("/subscribe")
    @Operation(summary = "Suscribirse al newsletter", description = "Registra un correo electrónico para recibir novedades")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suscripción realizada con éxito"),
            @ApiResponse(responseCode = "400", description = "Correo electrónico inválido"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public NewsletterResponse subscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
        return newsletterService.subscribe(request.getEmail());
    }

    @PostMapping("/unsubscribe")
    @Operation(summary = "Cancelar suscripción", description = "Da de baja una suscripción mediante su token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suscripción cancelada con éxito"),
            @ApiResponse(responseCode = "400", description = "Token inválido o faltante"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public NewsletterResponse unsubscribe(@Valid @RequestBody NewsletterUnsubscribeRequest request) {
        return newsletterService.unsubscribe(request.getToken());
    }
}
