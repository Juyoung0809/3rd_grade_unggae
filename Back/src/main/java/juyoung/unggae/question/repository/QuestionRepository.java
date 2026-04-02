package juyoung.unggae.question.repository;

import juyoung.unggae.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCourseIdOrderByCreatedAtDesc(Long courseId);
}
