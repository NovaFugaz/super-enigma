package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.ReceiptType;
import com.patito.sonidoVivo.enums.ShippingMethod;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
public class Order
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String orderNumber;

    @Column(unique = true, length = 30)
    private String trackingNumber;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

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

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate()
    {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate()
    {
        this.updatedAt = LocalDateTime.now();
    }

}