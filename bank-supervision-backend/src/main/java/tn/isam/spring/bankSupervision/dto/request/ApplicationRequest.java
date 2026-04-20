package tn.isam.spring.bankSupervision.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationRequest {
    private String name;
    private String servers;
    private String version;
    private String status;
}
