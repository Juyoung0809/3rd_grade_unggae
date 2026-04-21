package juyoung.unggae.lecture.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.lecture.dto.LectureCreateRequest;
import juyoung.unggae.lecture.dto.LectureOrderRequest;
import juyoung.unggae.lecture.dto.LectureResponse;
import juyoung.unggae.lecture.dto.LectureUpdateRequest;
import juyoung.unggae.lecture.entity.Lecture;
import juyoung.unggae.lecture.repository.LectureRepository;
import juyoung.unggae.section.entity.Section;
import juyoung.unggae.section.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LectureService {

    private final LectureRepository lectureRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<LectureResponse> getLectures(Long courseId) {
        return lectureRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(LectureResponse::from)
                .collect(Collectors.toList());
    }

    /** URL로 강의 추가 */
    public LectureResponse createLectureByUrl(Long instructorId, Long courseId, LectureCreateRequest request) {
        Course course = getCourseOwnedBy(courseId, instructorId);
        int nextOrder = lectureRepository.countByCourseId(courseId);

        Lecture lecture = Lecture.builder()
                .course(course)
                .title(request.getTitle())
                .orderIndex(nextOrder)
                .videoType(Lecture.VideoType.valueOf(request.getVideoType()))
                .videoUrl(request.getVideoUrl())
                .build();

        LectureResponse response = LectureResponse.from(lectureRepository.save(lecture));
        syncLectureCount(course);
        return response;
    }

    /** 파일 업로드로 강의 추가 */
    public LectureResponse createLectureByUpload(Long instructorId, Long courseId, String title, MultipartFile file) {
        Course course = getCourseOwnedBy(courseId, instructorId);
        String videoUrl = saveFile(file);
        int nextOrder = lectureRepository.countByCourseId(courseId);

        Lecture lecture = Lecture.builder()
                .course(course)
                .title(title)
                .orderIndex(nextOrder)
                .videoType(Lecture.VideoType.UPLOAD)
                .videoUrl(videoUrl)
                .build();

        LectureResponse response = LectureResponse.from(lectureRepository.save(lecture));
        syncLectureCount(course);
        return response;
    }

    /** 강의 수정 (URL) */
    public LectureResponse updateLectureByUrl(Long instructorId, Long lectureId, LectureUpdateRequest request) {
        Lecture lecture = getLectureOwnedBy(lectureId, instructorId);
        lecture.update(request.getTitle(), Lecture.VideoType.valueOf(request.getVideoType()), request.getVideoUrl());
        return LectureResponse.from(lecture);
    }

    /** 강의 수정 (파일 재업로드) */
    public LectureResponse updateLectureByUpload(Long instructorId, Long lectureId, String title, MultipartFile file) {
        Lecture lecture = getLectureOwnedBy(lectureId, instructorId);
        String videoUrl = saveFile(file);
        lecture.update(title, Lecture.VideoType.UPLOAD, videoUrl);
        return LectureResponse.from(lecture);
    }

    /** 강의 삭제 */
    public void deleteLecture(Long instructorId, Long lectureId) {
        Lecture lecture = getLectureOwnedBy(lectureId, instructorId);
        Course course = lecture.getCourse();
        lectureRepository.delete(lecture);
        lectureRepository.flush();
        syncLectureCount(course);
    }

    /** 섹션 내 강의 목록 조회 */
    @Transactional(readOnly = true)
    public List<LectureResponse> getLecturesBySection(Long sectionId) {
        return lectureRepository.findBySectionIdOrderByOrderIndexAsc(sectionId)
                .stream()
                .map(LectureResponse::from)
                .collect(Collectors.toList());
    }

    /** 섹션에 강의 추가 (URL) */
    public LectureResponse createSectionLectureByUrl(Long instructorId, Long sectionId, LectureCreateRequest request) {
        Section section = getSectionOwnedBy(sectionId, instructorId);
        int nextOrder = lectureRepository.countBySectionId(sectionId);

        Lecture lecture = Lecture.builder()
                .course(section.getCourse())
                .section(section)
                .title(request.getTitle())
                .orderIndex(nextOrder)
                .videoType(Lecture.VideoType.valueOf(request.getVideoType()))
                .videoUrl(request.getVideoUrl())
                .build();

        LectureResponse response = LectureResponse.from(lectureRepository.save(lecture));
        syncLectureCount(section.getCourse());
        return response;
    }

    /** 섹션에 강의 추가 (파일 업로드) */
    public LectureResponse createSectionLectureByUpload(Long instructorId, Long sectionId, String title, MultipartFile file) {
        Section section = getSectionOwnedBy(sectionId, instructorId);
        String videoUrl = saveFile(file);
        int nextOrder = lectureRepository.countBySectionId(sectionId);

        Lecture lecture = Lecture.builder()
                .course(section.getCourse())
                .section(section)
                .title(title)
                .orderIndex(nextOrder)
                .videoType(Lecture.VideoType.UPLOAD)
                .videoUrl(videoUrl)
                .build();

        LectureResponse response = LectureResponse.from(lectureRepository.save(lecture));
        syncLectureCount(section.getCourse());
        return response;
    }

    /** 섹션 내 강의 순서 변경 */
    public void reorderSectionLectures(Long instructorId, Long sectionId, LectureOrderRequest request) {
        getSectionOwnedBy(sectionId, instructorId);
        List<Lecture> lectures = lectureRepository.findBySectionIdOrderByOrderIndexAsc(sectionId);
        List<Long> orderedIds = request.getOrderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            lectures.stream()
                    .filter(l -> l.getId().equals(orderedIds.get(order)))
                    .findFirst()
                    .ifPresent(l -> l.updateOrder(order));
        }
    }

    // ── helpers ──────────────────────────────────────────────

    private Section getSectionOwnedBy(Long sectionId, Long instructorId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SECTION_NOT_FOUND));
        if (!section.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new CustomException(ErrorCode.SECTION_FORBIDDEN);
        }
        return section;
    }

    private Course getCourseOwnedBy(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new CustomException(ErrorCode.COURSE_FORBIDDEN);
        }
        return course;
    }

    private Lecture getLectureOwnedBy(Long lectureId, Long instructorId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new CustomException(ErrorCode.LECTURE_NOT_FOUND));
        if (!lecture.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new CustomException(ErrorCode.COURSE_FORBIDDEN);
        }
        return lecture;
    }

    private void syncLectureCount(Course course) {
        int count = lectureRepository.countByCourseId(course.getId());
        course.updateLectureCount(count);
    }

    private String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String originalFilename = file.getOriginalFilename() != null
                    ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                    : "video";
            String filename = UUID.randomUUID() + "_" + originalFilename;
            Files.copy(file.getInputStream(), uploadPath.resolve(filename));
            return "/videos/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다.", e);
        }
    }
}
