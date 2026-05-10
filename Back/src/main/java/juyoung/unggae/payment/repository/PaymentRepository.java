package juyoung.unggae.payment.repository;

import juyoung.unggae.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p JOIN FETCH p.user JOIN FETCH p.course c JOIN FETCH c.instructor WHERE p.user.id = :userId ORDER BY p.paidAt DESC")
    List<Payment> findByUserIdOrderByPaidAtDesc(@Param("userId") Long userId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.user JOIN FETCH p.course c JOIN FETCH c.instructor ORDER BY p.paidAt DESC")
    List<Payment> findAllOrderByPaidAtDesc();
}
