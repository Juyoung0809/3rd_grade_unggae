package juyoung.unggae.rating.repository;

import juyoung.unggae.rating.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    List<Rating> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    @Query("SELECT COALESCE(AVG(r.score), 0.0) FROM Rating r WHERE r.course.id = :courseId")
    double findAverageScoreByCourseId(@Param("courseId") Long courseId);
}
