package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;
import java.util.List;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.ReceiptType;
import com.patito.sonidoVivo.enums.ShippingMethod;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String orderNumber;

    @Column(nullable = false, unique = true, length = 30)
    private String trackingNumber;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShippingMethod shippingMethod;

    @Column(length = 250)
    private String shippingAddress;

    @Column(name = "pickup_location_id")
    private Long pickupLocationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDIENTE;

    @Column(nullable = false)
    private Long subtotal;

    @Column(nullable = false)
    private Long shippingCost = 0L;

    @Column(nullable = false)
    private Long iva;

    @Column(nullable = false)
    private Long total;

    private String receiptNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReceiptType receiptType;

    private LocalDateTime receiptIssuedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}