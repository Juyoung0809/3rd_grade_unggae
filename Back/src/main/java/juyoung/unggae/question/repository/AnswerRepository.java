package juyoung.unggae.question.repository;

import juyoung.unggae.question.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByQuestionIdOrderByCreatedAtAsc(Long questionId);

    int countByQuestionId(Long questionId);
}
