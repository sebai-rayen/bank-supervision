package tn.isam.spring.bankSupervision.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.isam.spring.bankSupervision.entity.Server;
import tn.isam.spring.bankSupervision.dto.request.ServerRequest;
import tn.isam.spring.bankSupervision.service.ServerService;

import java.util.List;

@RestController
@RequestMapping("/api/servers")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ServerController {

    private final ServerService serverService;

    @GetMapping
    public List<Server> getAllServers() {
        return serverService.getAllServers();
    }

    @GetMapping("/{id}")
    public Server getServerById(@PathVariable Long id) {
        return serverService.getServerById(id);
    }

    @PostMapping
    public ResponseEntity<Server> addServer(@RequestBody ServerRequest server) {
        return ResponseEntity.ok(serverService.addServer(server));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Server> updateServer(@PathVariable Long id,
                                               @RequestBody ServerRequest updatedServer) {
        return ResponseEntity.ok(serverService.updateServer(id, updatedServer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServer(@PathVariable Long id) {
        serverService.deleteServer(id);
        return ResponseEntity.noContent().build();
    }
}
