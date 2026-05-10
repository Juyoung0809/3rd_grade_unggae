package juyoung.unggae.section.repository;

import juyoung.unggae.section.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {

    @Query("SELECT s FROM Section s WHERE s.course.id = :courseId ORDER BY s.orderNum ASC")
    List<Section> findByCourseIdOrderByOrderNumAsc(@Param("courseId") Long courseId);

    int countByCourseId(Long courseId);
}
