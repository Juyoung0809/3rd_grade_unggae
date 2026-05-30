package juyoung.unggae.payment.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
public class TossPaymentService {

    private final WebClient webClient;
    private final String secretKey;

    public TossPaymentService(
            @Value("${toss.api-url}") String apiUrl,
            @Value("${toss.secret-key}") String secretKey) {
        this.secretKey = secretKey;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", buildAuthHeader(secretKey))
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    private String buildAuthHeader(String key) {
        String credentials = key + ":";
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    public Map<String, Object> confirm(String paymentKey, String orderId, BigDecimal amount) {
        Map<String, Object> body = Map.of(
                "paymentKey", paymentKey,
                "orderId", orderId,
                "amount", amount
        );

        return webClient.post()
                .uri("/payments/confirm")
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .map(errorBody -> {
                                    log.error("Toss confirm 실패: {}", errorBody);
                                    return new CustomException(ErrorCode.PAYMENT_CONFIRM_FAILED);
                                })
                )
                .bodyToMono(Map.class)
                .cast(Map.class)
                .map(m -> (Map<String, Object>) m)
                .block();
    }

    public Map<String, Object> cancel(String paymentKey, String cancelReason) {
        Map<String, Object> body = Map.of("cancelReason", cancelReason);

        return webClient.post()
                .uri("/payments/{paymentKey}/cancel", paymentKey)
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .map(errorBody -> {
                                    log.error("Toss cancel 실패: {}", errorBody);
                                    return new CustomException(ErrorCode.PAYMENT_CANCEL_FAILED);
                                })
                )
                .bodyToMono(Map.class)
                .cast(Map.class)
                .map(m -> (Map<String, Object>) m)
                .block();
    }
}
