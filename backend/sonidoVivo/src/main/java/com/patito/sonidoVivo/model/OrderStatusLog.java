package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.UserRole;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name = "historial_estados")
@Getter 
@Setter 
public class OrderStatusLog {

    private Long id;
    private Long oderId;
    private OrderStatus fromStatus;
    private Long actorId;
    private UserRole actorRole;
    private LocalDateTime createdAt;
    
}
