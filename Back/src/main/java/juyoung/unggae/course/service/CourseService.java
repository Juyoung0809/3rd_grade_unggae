package juyoung.unggae.course.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.common.response.PageResponse;
import juyoung.unggae.course.dto.CourseCreateRequest;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.dto.CourseUpdateRequest;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.entity.Enrollment;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
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
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    private long getEnrollmentCount(Long courseId) {
        return enrollmentRepository.countByCourseIdAndStatus(courseId, Enrollment.Status.ACTIVE);
    }

    public CourseResponse getCourseDetail(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        double avg = ratingRepository.findAverageScoreByCourseId(courseId);
        return CourseResponse.of(course, avg, getEnrollmentCount(courseId));
    }

    public PageResponse<CourseResponse> getCourses(String category, String keyword, String sort, int page, int size) {
        List<Course> courses = courseRepository.findPublishedCourses(
                category != null ? category.toUpperCase() : null,
                keyword
        );
        List<CourseResponse> responses = courses.stream()
                .map(c -> CourseResponse.of(
                        c,
                        ratingRepository.findAverageScoreByCourseId(c.getId()),
                        getEnrollmentCount(c.getId())))
                .collect(Collectors.toList());

        if ("RATING".equalsIgnoreCase(sort)) {
            responses.sort((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()));
        } else if ("STUDENTS".equalsIgnoreCase(sort)) {
            responses.sort((a, b) -> Long.compare(b.getEnrollmentCount(), a.getEnrollmentCount()));
        }

        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 12 : size;
        int totalElements = responses.size();
        int fromIndex = Math.min(safePage * safeSize, totalElements);
        int toIndex = Math.min(fromIndex + safeSize, totalElements);
        List<CourseResponse> content = responses.subList(fromIndex, toIndex);

        return PageResponse.of(content, safePage, safeSize, totalElements);
    }

    @Transactional
    public CourseResponse createCourse(Long userId, CourseCreateRequest request) {
        User instructor = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (instructor.getRole() != User.Role.INSTRUCTOR) {
            throw new CustomException(ErrorCode.NOT_INSTRUCTOR);
        }

        Course course = Course.builder()
                .instructor(instructor)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(Course.Category.valueOf(request.getCategory()))
                .price(request.getPrice())
                .thumbnail(request.getThumbnail())
                .lectureCount(0)
                .build();

        return CourseResponse.of(courseRepository.save(course), 0.0, 0L);
    }

    public List<CourseResponse> getInstructorCourses(Long userId) {
        User instructor = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (instructor.getRole() != User.Role.INSTRUCTOR) {
            throw new CustomException(ErrorCode.NOT_INSTRUCTOR);
        }

        return courseRepository.findByInstructorIdExcludingDeleted(userId)
                .stream()
                .map(c -> CourseResponse.of(
                        c,
                        ratingRepository.findAverageScoreByCourseId(c.getId()),
                        getEnrollmentCount(c.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse updateCourse(Long userId, Long courseId, CourseUpdateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() == Course.Status.DELETED) {
            throw new CustomException(ErrorCode.COURSE_ALREADY_DELETED);
        }

        if (!course.getInstructor().getId().equals(userId)) {
            throw new CustomException(ErrorCode.COURSE_FORBIDDEN);
        }

        course.update(
                request.getTitle(),
                request.getDescription(),
                Course.Category.valueOf(request.getCategory()),
                request.getPrice(),
                request.getThumbnail()
        );

        double avg = ratingRepository.findAverageScoreByCourseId(courseId);
        return CourseResponse.of(course, avg, getEnrollmentCount(courseId));
    }

    @Transactional
    public void deleteCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() == Course.Status.DELETED) {
            throw new CustomException(ErrorCode.COURSE_ALREADY_DELETED);
        }

        if (!course.getInstructor().getId().equals(userId)) {
            throw new CustomException(ErrorCode.COURSE_FORBIDDEN);
        }

        course.softDelete();
    }
}
