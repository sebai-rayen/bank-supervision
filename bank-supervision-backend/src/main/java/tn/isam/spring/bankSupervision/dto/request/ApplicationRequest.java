package tn.isam.spring.bankSupervision.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class ApplicationRequest {
    private String name;

    @JsonAlias({"server", "serverName"})
    private String servers;

    @JsonAlias({"server_id", "serverID"})
    private Long serverId;
    
    @NotNull(message = "L'utilisateur assigné est obligatoire")
    private Long assignedUserId;
    
    private String version;
    private String status;
}
