package juyoung.unggae.course.repository;

import juyoung.unggae.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
            SELECT c FROM Course c JOIN FETCH c.instructor
            WHERE c.status = 'PUBLISHED'
            AND (:category IS NULL OR CAST(c.category AS string) = :category)
            AND (:keyword IS NULL OR c.title LIKE %:keyword% OR c.description LIKE %:keyword%)
            ORDER BY c.createdAt DESC
            """)
    List<Course> findPublishedCourses(
            @Param("category") String category,
            @Param("keyword") String keyword
    );
}
