package juyoung.unggae.question.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import juyoung.unggae.question.dto.*;
import juyoung.unggae.question.entity.Answer;
import juyoung.unggae.question.entity.Question;
import juyoung.unggae.question.repository.AnswerRepository;
import juyoung.unggae.question.repository.QuestionRepository;
import juyoung.unggae.user.entity.User;
import juyoung.unggae.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public QuestionResponse createQuestion(Long userId, QuestionRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            throw new CustomException(ErrorCode.QUESTION_WRITE_FORBIDDEN);
        }

        Question question = Question.builder()
                .course(course)
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        return QuestionResponse.of(questionRepository.save(question), List.of());
    }

    public QuestionResponse updateQuestion(Long userId, Long questionId, QuestionUpdateRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUESTION_NOT_FOUND));

        if (!question.getAuthor().getId().equals(userId)) {
            throw new CustomException(ErrorCode.QUESTION_FORBIDDEN);
        }

        question.update(request.getTitle(), request.getContent());
        List<Answer> answers = answerRepository.findByQuestionIdOrderByCreatedAtAsc(questionId);
        return QuestionResponse.of(question, answers);
    }

    @Transactional(readOnly = true)
    public List<QuestionSummaryResponse> getCourseQuestions(Long courseId) {
        return questionRepository.findByCourseIdOrderByCreatedAtDesc(courseId)
                .stream()
                .map(q -> QuestionSummaryResponse.of(q, answerRepository.countByQuestionId(q.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUESTION_NOT_FOUND));
        List<Answer> answers = answerRepository.findByQuestionIdOrderByCreatedAtAsc(questionId);
        return QuestionResponse.of(question, answers);
    }

    public AnswerResponse createAnswer(Long userId, Long questionId, AnswerRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUESTION_NOT_FOUND));

        Long courseId = question.getCourse().getId();
        boolean isInstructor = question.getCourse().getInstructor().getId().equals(userId);
        boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);

        if (!isInstructor && !isEnrolled) {
            throw new CustomException(ErrorCode.ANSWER_WRITE_FORBIDDEN);
        }

        Answer answer = Answer.builder()
                .question(question)
                .author(author)
                .content(request.getContent())
                .instructorAnswer(author.getRole() == User.Role.INSTRUCTOR)
                .build();

        return AnswerResponse.from(answerRepository.save(answer));
    }

    public AnswerResponse updateAnswer(Long userId, Long answerId, AnswerUpdateRequest request) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new CustomException(ErrorCode.ANSWER_NOT_FOUND));

        if (!answer.getAuthor().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ANSWER_FORBIDDEN);
        }

        answer.update(request.getContent());
        return AnswerResponse.from(answer);
    }

    public void deleteQuestion(Long userId, Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUESTION_NOT_FOUND));
        if (!question.getAuthor().getId().equals(userId)) {
            throw new CustomException(ErrorCode.QUESTION_FORBIDDEN);
        }
        answerRepository.deleteByQuestionId(questionId);
        questionRepository.delete(question);
    }

    public void deleteAnswer(Long userId, Long answerId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new CustomException(ErrorCode.ANSWER_NOT_FOUND));
        if (!answer.getAuthor().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ANSWER_FORBIDDEN);
        }
        answerRepository.delete(answer);
    }
}
