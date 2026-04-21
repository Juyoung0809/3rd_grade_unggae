package juyoung.unggae.lecture.repository;

import juyoung.unggae.lecture.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    List<Lecture> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    List<Lecture> findBySectionIdOrderByOrderIndexAsc(Long sectionId);

    int countByCourseId(Long courseId);

    int countBySectionId(Long sectionId);

    boolean existsByIdAndCourseInstructorId(Long lectureId, Long instructorId);
}
