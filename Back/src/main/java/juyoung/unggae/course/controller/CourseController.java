package juyoung.unggae.course.controller;

import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        List<CourseResponse> responses = courseService.getCourses(category, keyword);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseDetail(@PathVariable Long courseId) {
        CourseResponse response = courseService.getCourseDetail(courseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
