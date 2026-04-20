package tn.isam.spring.bankSupervision.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AdminAlertResponse {

    private IncomingAlert latest;
    private List<ReceivedAlert> alerts;

    @Getter
    @Setter
    public static class IncomingAlert {
        private Long id;
        private String server;
        private String subject;
        private String message;
        private String time;
        private String severity;
    }

    @Getter
    @Setter
    public static class ReceivedAlert {
        private Long id;
        private String server;
        private String type;
        private String severity;
        private String email;
        private String time;
        private String message;
    }
}

