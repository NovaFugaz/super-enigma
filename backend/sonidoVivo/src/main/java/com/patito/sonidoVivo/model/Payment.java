package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import com.patito.sonidoVivo.enums.PaymentMethod;
import com.patito.sonidoVivo.enums.PaymentStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name = "pagos")
@Getter 
@Setter 
public class Payment {

    private Long id;
    private Long orderId;
    private PaymentMethod method;
    private PaymentStatus status;
    private Long amount;
    private String transactionId;
    private String authorizationCode;
    private LocalDateTime createdAt;
}
