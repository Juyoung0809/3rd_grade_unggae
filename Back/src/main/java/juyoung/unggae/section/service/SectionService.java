package juyoung.unggae.section.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.lecture.dto.LectureResponse;
import juyoung.unggae.lecture.repository.LectureRepository;
import juyoung.unggae.section.dto.SectionCreateRequest;
import juyoung.unggae.section.dto.SectionOrderRequest;
import juyoung.unggae.section.dto.SectionResponse;
import juyoung.unggae.section.dto.SectionUpdateRequest;
import juyoung.unggae.section.entity.Section;
import juyoung.unggae.section.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SectionService {

    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;

    @Transactional(readOnly = true)
    public List<SectionResponse> getSections(Long courseId) {
        return sectionRepository.findByCourseIdOrderByOrderNumAsc(courseId)
                .stream()
                .map(section -> {
                    List<LectureResponse> lectures = lectureRepository
                            .findBySectionIdOrderByOrderIndexAsc(section.getId())
                            .stream()
                            .map(LectureResponse::from)
                            .collect(Collectors.toList());
                    return SectionResponse.of(section, lectures);
                })
                .collect(Collectors.toList());
    }

    public SectionResponse createSection(Long instructorId, Long courseId, SectionCreateRequest request) {
        Course course = getCourseOwnedBy(courseId, instructorId);
        int nextOrder = sectionRepository.countByCourseId(courseId);

        Section section = Section.builder()
                .course(course)
                .title(request.getTitle())
                .orderNum(nextOrder)
                .build();

        return SectionResponse.from(sectionRepository.save(section));
    }

    public SectionResponse updateSection(Long instructorId, Long sectionId, SectionUpdateRequest request) {
        Section section = getSectionOwnedBy(sectionId, instructorId);
        section.update(request.getTitle());
        return SectionResponse.from(section);
    }

    public void deleteSection(Long instructorId, Long sectionId) {
        Section section = getSectionOwnedBy(sectionId, instructorId);
        sectionRepository.delete(section);
    }

    public void reorderSections(Long instructorId, Long courseId, SectionOrderRequest request) {
        getCourseOwnedBy(courseId, instructorId);
        List<Section> sections = sectionRepository.findByCourseIdOrderByOrderNumAsc(courseId);

        List<Long> orderedIds = request.getOrderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            sections.stream()
                    .filter(s -> s.getId().equals(orderedIds.get(order)))
                    .findFirst()
                    .ifPresent(s -> s.updateOrder(order));
        }
    }

    private Course getCourseOwnedBy(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new CustomException(ErrorCode.COURSE_FORBIDDEN);
        }
        return course;
    }

    private Section getSectionOwnedBy(Long sectionId, Long instructorId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SECTION_NOT_FOUND));
        if (!section.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new CustomException(ErrorCode.SECTION_FORBIDDEN);
        }
        return section;
    }
}
