package tn.isam.spring.bankSupervision.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServerResponse {
    private Long id;
    private String name;
    private String ipAddress;
    private Integer port;
    private String os;
    private String system;
    private String status;
    private LocalDateTime lastCheck;
}
