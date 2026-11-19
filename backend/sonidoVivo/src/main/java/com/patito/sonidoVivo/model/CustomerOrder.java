package com.patito.sonidoVivo.model;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Persistable;

import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.ShippingMethod;

@Entity
@Table(name = "orders",
       uniqueConstraints = @UniqueConstraint(name = "uk_orders_tracking", columnNames = "tracking_number"))
@Getter
@Setter
@NoArgsConstructor
public class CustomerOrder implements Persistable<String> {

    /** El servicio asigna el identificador con prefijo SV-. */
    @Id
    @NotBlank(message = "El id del pedido es obligatorio")
    @Size(max = 30, message = "El id del pedido no puede superar los 30 caracteres")
    @Column(length = 30)
    private String id;

    @NotBlank(message = "El número de seguimiento es obligatorio")
    @Size(max = 30, message = "El número de seguimiento no puede superar los 30 caracteres")
    @Column(name = "tracking_number", nullable = false, length = 30)
    private String trackingNumber;

    @NotNull(message = "El cliente es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @NotNull(message = "El estado es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.EN_PROCESO;

    @NotNull(message = "El método de envío es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_method", nullable = false, length = 20)
    private ShippingMethod shippingMethod;

    @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
    @Column(name = "shipping_address", length = 200)
    private String shippingAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_location_id")
    private Location pickupLocation;

    @NotNull(message = "El subtotal es obligatorio")
    @PositiveOrZero(message = "El subtotal no puede ser negativo")
    @Column(nullable = false)
    private Integer subtotal;

    @NotNull(message = "El IVA es obligatorio")
    @PositiveOrZero(message = "El IVA no puede ser negativo")
    @Column(nullable = false)
    private Integer tax;

    @NotNull(message = "El costo de envío es obligatorio")
    @PositiveOrZero(message = "El costo de envío no puede ser negativo")
    @Column(name = "shipping_cost", nullable = false)
    private Integer shippingCost;

    @NotNull(message = "El total es obligatorio")
    @PositiveOrZero(message = "El total no puede ser negativo")
    @Column(nullable = false)
    private Integer total;

    @Size(max = 40)
    @Column(name = "payment_transaction_id", length = 40)
    private String paymentTransactionId;

    @Size(max = 20)
    @Column(name = "payment_authorization", length = 20)
    private String paymentAuthorization;

    @Size(max = 40)
    @Column(name = "receipt_number", length = 40)
    private String receiptNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Transient
    private boolean newEntity = true;

    @NotEmpty(message = "El pedido debe tener al menos un producto")
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<@Valid OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC, id ASC")
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @PrePersist
    private void beforeSave() {
        if (createdAt == null) createdAt = Instant.now();
    }

    // Esto es para que JPA pueda determinar si la entidad es nueva o no.
    // Esto porque el id lo está asignando el service.
    @Override
    public boolean isNew() {
        return newEntity;
    }

    @PostPersist
    @PostLoad
    private void markNotNew() {
        newEntity = false;
    }

    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
    }

    public void addHistory(OrderStatusHistory entry) {
        entry.setOrder(this);
        statusHistory.add(entry);
    }
}