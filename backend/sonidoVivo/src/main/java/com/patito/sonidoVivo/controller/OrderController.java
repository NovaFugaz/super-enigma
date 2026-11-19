package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.pedido.OrderCreateRequest;
import com.patito.sonidoVivo.dto.pedido.OrderResponse;
import com.patito.sonidoVivo.dto.pedido.OrderTrackingResponse;
import com.patito.sonidoVivo.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Crear pedido del cliente autenticado",
            description = "Precios, impuestos, despacho y stock se calculan en el backend. El pago es una simulación.")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody OrderCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return orderService.create(request, jwt.getSubject());
    }

    @GetMapping("/mine")
    @Operation(summary = "Listar pedidos del cliente autenticado")
    public List<OrderResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return orderService.findMine(jwt.getSubject());
    }

    @GetMapping("/tracking/{trackingNumber}")
    @Operation(summary = "Consultar seguimiento público con su número de seguimiento")
    public OrderTrackingResponse track(@PathVariable String trackingNumber) {
        return orderService.track(trackingNumber);
    }
}
