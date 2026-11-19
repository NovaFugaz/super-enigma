package com.patito.sonidoVivo.repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.patito.sonidoVivo.model.CustomerOrder;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, String> {

    List<CustomerOrder> findAllByCustomer_IdOrderByCreatedAtDesc(Long customerId);

    Optional<CustomerOrder> findByTrackingNumber(String trackingNumber);

    // Pessimistic para que no se pueda actualizar el pedido mientras se está procesando el pago
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from CustomerOrder o where o.id = :id")
    Optional<CustomerOrder> findByIdForUpdate(@Param("id") String id);
}
