package juyoung.unggae.admin.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
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
public class AdminCourseService {

    private final CourseRepository courseRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    private void checkAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() != User.Role.ADMIN) {
            throw new CustomException(ErrorCode.ADMIN_FORBIDDEN);
        }
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses(Long userId) {
        checkAdmin(userId);
        return courseRepository.findAllWithInstructor()
                .stream()
                .map(c -> CourseResponse.of(c, ratingRepository.findAverageScoreByCourseId(c.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getPendingCourses(Long userId) {
        checkAdmin(userId);
        return courseRepository.findByStatus(Course.Status.PENDING)
                .stream()
                .map(c -> CourseResponse.of(c, ratingRepository.findAverageScoreByCourseId(c.getId())))
                .collect(Collectors.toList());
    }

    public CourseResponse approveCourse(Long userId, Long courseId) {
        checkAdmin(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        course.approve();
        return CourseResponse.of(course, ratingRepository.findAverageScoreByCourseId(courseId));
    }

    public CourseResponse rejectCourse(Long userId, Long courseId) {
        checkAdmin(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        course.reject();
        return CourseResponse.of(course, ratingRepository.findAverageScoreByCourseId(courseId));
    }
}
