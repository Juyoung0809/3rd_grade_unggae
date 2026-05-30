package juyoung.unggae.common.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@Order(1)
public class RequestLoggingFilter implements Filter {

    private static final String REQUEST_ID = "requestId";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest)  req;
        HttpServletResponse response = (HttpServletResponse) res;

        String requestId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put(REQUEST_ID, requestId);
        response.setHeader("X-Request-Id", requestId);

        long start = System.currentTimeMillis();

        try {
            log.info("[REQ] {} {} (ip={})", request.getMethod(), request.getRequestURI(),
                    request.getRemoteAddr());
            chain.doFilter(req, res);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            log.info("[RES] {} {} → {} ({}ms)",
                    request.getMethod(), request.getRequestURI(),
                    response.getStatus(), elapsed);
            MDC.remove(REQUEST_ID);
        }
    }
}
