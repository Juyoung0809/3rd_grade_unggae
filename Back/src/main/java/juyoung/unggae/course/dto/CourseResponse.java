package juyoung.unggae.course.dto;

import juyoung.unggae.course.entity.Course;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class CourseResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final BigDecimal price;
    private final String category;
    private final String status;
    private final String thumbnailUrl;
    private final double averageRating;
    private final int lectureCount;
    private final InstructorInfo instructor;

    @Getter
    public static class InstructorInfo {
        private final Long id;
        private final String name;

        public InstructorInfo(Long id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    private CourseResponse(Course course, double averageRating) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.description = course.getDescription();
        this.price = course.getPrice();
        this.category = course.getCategory().name();
        this.status = course.getStatus().name();
        this.thumbnailUrl = course.getThumbnail();
        this.averageRating = averageRating;
        this.lectureCount = course.getLectureCount();
        this.instructor = new InstructorInfo(
                course.getInstructor().getId(),
                course.getInstructor().getNickname()
        );
    }

    public static CourseResponse of(Course course, double averageRating) {
        return new CourseResponse(course, averageRating);
    }
}
