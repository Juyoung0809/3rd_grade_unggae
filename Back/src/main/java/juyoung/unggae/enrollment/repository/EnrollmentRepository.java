package juyoung.unggae.enrollment.repository;

import juyoung.unggae.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course c JOIN FETCH c.instructor WHERE e.user.id = :userId AND e.status = 'ACTIVE'")
    List<Enrollment> findActiveEnrollmentsByUserId(@Param("userId") Long userId);
}
