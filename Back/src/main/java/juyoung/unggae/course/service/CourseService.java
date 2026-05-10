package juyoung.unggae.course.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.dto.CourseCreateRequest;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.dto.CourseUpdateRequest;
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
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    public CourseResponse getCourseDetail(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        double avg = ratingRepository.findAverageScoreByCourseId(courseId);
        return CourseResponse.of(course, avg);
    }

    public List<CourseResponse> getCourses(String category, String keyword, String sort) {
        List<Course> courses = courseRepository.findPublishedCourses(
                category != null ? category.toUpperCase() : null,
                keyword
        );
        List<CourseResponse> responses = courses.stream()
                .map(c -> CourseResponse.of(c, ratingRepository.findAverageScoreByCourseId(c.getId())))
                .collect(Collectors.toList());

        if ("RATING".equalsIgnoreCase(sort)) {
            responses.sort((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()));
        } else if ("STUDENTS".equalsIgnoreCase(sort)) {
            responses.sort((a, b) -> Integer.compare(b.getLectureCount(), a.getLectureCount()));
        }
        return responses;
    }

    public List<CourseResponse> getCourses(String category, String keyword) {
        return getCourses(category, keyword, "LATEST");
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

        return CourseResponse.of(courseRepository.save(course), 0.0);
    }

    public List<CourseResponse> getInstructorCourses(Long userId) {
        User instructor = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (instructor.getRole() != User.Role.INSTRUCTOR) {
            throw new CustomException(ErrorCode.NOT_INSTRUCTOR);
        }

        return courseRepository.findByInstructorIdExcludingDeleted(userId)
                .stream()
                .map(c -> CourseResponse.of(c, ratingRepository.findAverageScoreByCourseId(c.getId())))
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
        return CourseResponse.of(course, avg);
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
