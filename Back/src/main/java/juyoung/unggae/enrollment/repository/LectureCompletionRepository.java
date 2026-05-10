package juyoung.unggae.enrollment.repository;

import juyoung.unggae.enrollment.entity.LectureCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LectureCompletionRepository extends JpaRepository<LectureCompletion, Long> {

    boolean existsByEnrollmentIdAndLectureId(Long enrollmentId, Long lectureId);

    int countByEnrollmentId(Long enrollmentId);

    @Query("SELECT lc.lectureId FROM LectureCompletion lc WHERE lc.enrollment.id = :enrollmentId")
    List<Long> findLectureIdsByEnrollmentId(@Param("enrollmentId") Long enrollmentId);
}
