package tn.isam.spring.bankSupervision.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.isam.spring.bankSupervision.entity.Application;
import tn.isam.spring.bankSupervision.dto.request.ApplicationRequest;
import tn.isam.spring.bankSupervision.service.ApplicationService;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public List<Application> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/{id}")
    public Application getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id);
    }

    @PostMapping
    public ResponseEntity<Application> addApplication(@RequestBody ApplicationRequest application) {
        return ResponseEntity.ok(applicationService.addApplication(application));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable Long id,
                                                         @RequestBody ApplicationRequest updatedApplication) {
        return ResponseEntity.ok(applicationService.updateApplication(id, updatedApplication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
