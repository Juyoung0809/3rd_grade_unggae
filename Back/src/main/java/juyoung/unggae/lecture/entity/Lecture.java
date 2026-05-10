package juyoung.unggae.lecture.entity;

import jakarta.persistence.*;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.section.entity.Section;
import lombok.*;

@Entity
@Table(name = "lectures")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "video_type", nullable = false)
    private VideoType videoType;

    @Column(name = "video_url", nullable = false, length = 1000)
    private String videoUrl;

    public void update(String title, VideoType videoType, String videoUrl) {
        this.title = title;
        this.videoType = videoType;
        this.videoUrl = videoUrl;
    }

    public void updateSection(Section section) {
        this.section = section;
    }

    public void updateOrder(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public enum VideoType {
        URL, UPLOAD
    }
}
