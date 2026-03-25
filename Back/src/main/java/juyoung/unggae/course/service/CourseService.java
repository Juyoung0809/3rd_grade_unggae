package juyoung.unggae.course.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.rating.repository.RatingRepository;
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

    public CourseResponse getCourseDetail(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        double avg = ratingRepository.findAverageScoreByCourseId(courseId);
        return CourseResponse.of(course, avg);
    }

    public List<CourseResponse> getCourses(String category, String keyword) {
        List<Course> courses = courseRepository.findPublishedCourses(
                category != null ? category.toUpperCase() : null,
                keyword
        );
        return courses.stream()
                .map(c -> CourseResponse.of(c, ratingRepository.findAverageScoreByCourseId(c.getId())))
                .collect(Collectors.toList());
    }
}
