package tn.isam.spring.bankSupervision.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.isam.spring.bankSupervision.dto.request.ServerRequest;
import tn.isam.spring.bankSupervision.dto.response.ServerResponse;
import tn.isam.spring.bankSupervision.mapper.ServerMapper;
import tn.isam.spring.bankSupervision.service.ServerService;

import java.util.List;

@RestController
@RequestMapping("/api/servers")
@RequiredArgsConstructor
public class ServerController {

    private final ServerService serverService;
    private final ServerMapper serverMapper;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public List<ServerResponse> getAllServers() {
        return serverService.getAllServers()
                .stream()
                .map(serverMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ServerResponse getServerById(@PathVariable Long id) {
        return serverMapper.toResponse(serverService.getServerById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServerResponse> addServer(@RequestBody ServerRequest server) {
        return ResponseEntity.ok(serverMapper.toResponse(serverService.addServer(server)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServerResponse> updateServer(@PathVariable Long id,
                                               @RequestBody ServerRequest updatedServer) {
        return ResponseEntity.ok(serverMapper.toResponse(serverService.updateServer(id, updatedServer)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteServer(@PathVariable Long id) {
        serverService.deleteServer(id);
        return ResponseEntity.noContent().build();
    }
}
