package tn.isam.spring.bankSupervision.mapper;

import org.springframework.stereotype.Component;
import tn.isam.spring.bankSupervision.dto.response.ServerResponse;
import tn.isam.spring.bankSupervision.entity.Server;

@Component
public class ServerMapper {

    public ServerResponse toResponse(Server server) {
        if (server == null) {
            return null;
        }

        return ServerResponse.builder()
                .id(server.getId())
                .name(server.getName())
                .ipAddress(server.getIpAddress())
                .port(server.getPort())
                .os(server.getOs())
                .system(server.getSystem())
                .status(server.getStatus())
                .lastCheck(server.getLastCheck())
                .build();
    }
}
