package tn.isam.spring.bankSupervision.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServerRequest {
    private String name;
    private String ipAddress;
    private Integer port;
    private String os;
    private String system;
    private String status;
}
