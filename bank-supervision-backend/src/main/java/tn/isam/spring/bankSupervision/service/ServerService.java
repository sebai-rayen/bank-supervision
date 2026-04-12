package tn.isam.spring.bankSupervision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tn.isam.spring.bankSupervision.entity.Server;
import tn.isam.spring.bankSupervision.request.ServerRequest;
import tn.isam.spring.bankSupervision.repository.ServerRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;

    public List<Server> getAllServers() {
        return serverRepository.findAll();
    }

    public Server getServerById(Long id) {
        return serverRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serveur introuvable"));
    }

    public Server addServer(ServerRequest request) {
        Server server = new Server();
        server.setName(request.getName());
        server.setIpAddress(request.getIpAddress());
        server.setPort(request.getPort());
        server.setOs(request.getOs());
        server.setSystem(request.getSystem());

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            server.setStatus("Online");
        } else {
            server.setStatus(request.getStatus());
        }

        server.setLastCheck(LocalDateTime.now());
        return serverRepository.save(server);
    }

    public Server updateServer(Long id, ServerRequest updatedServer) {
        Server server = getServerById(id);

        server.setName(updatedServer.getName());
        server.setIpAddress(updatedServer.getIpAddress());
        server.setPort(updatedServer.getPort());
        server.setOs(updatedServer.getOs());
        server.setSystem(updatedServer.getSystem());

        if (updatedServer.getStatus() == null || updatedServer.getStatus().isBlank()) {
            server.setStatus("Online");
        } else {
            server.setStatus(updatedServer.getStatus());
        }

        server.setLastCheck(LocalDateTime.now());

        return serverRepository.save(server);
    }

    public void deleteServer(Long id) {
        if (!serverRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Serveur introuvable");
        }
        serverRepository.deleteById(id);
    }
}
