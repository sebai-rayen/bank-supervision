package tn.isam.spring.bankSupervision.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAlertResponse {
    private Long id;
    private String server;
    private String type;
    private String severity;
    private String subject;
    private String message;
    private String recipientEmail;
    private String recipientName;
    private String sentBy;
    private String time;
    private Long createdAt;
}
