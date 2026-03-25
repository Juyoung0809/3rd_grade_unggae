package juyoung.unggae.rating.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import juyoung.unggae.rating.dto.RatingRequest;
import juyoung.unggae.rating.dto.RatingResponse;
import juyoung.unggae.rating.entity.Rating;
import juyoung.unggae.rating.repository.RatingRepository;
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
public class RatingService {

    private final RatingRepository ratingRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public RatingResponse addRating(Long userId, RatingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            throw new CustomException(ErrorCode.NOT_ENROLLED);
        }

        if (ratingRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            throw new CustomException(ErrorCode.RATING_ALREADY_EXISTS);
        }

        Rating rating = Rating.builder()
                .user(user)
                .course(course)
                .score(request.getScore())
                .comment(request.getComment())
                .build();

        return RatingResponse.from(ratingRepository.save(rating));
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> getCourseRatings(Long courseId) {
        return ratingRepository.findByCourseIdOrderByCreatedAtDesc(courseId)
                .stream()
                .map(RatingResponse::from)
                .collect(Collectors.toList());
    }
}
