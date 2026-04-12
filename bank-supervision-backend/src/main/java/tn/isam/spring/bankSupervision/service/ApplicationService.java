package tn.isam.spring.bankSupervision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tn.isam.spring.bankSupervision.entity.Application;
import tn.isam.spring.bankSupervision.request.ApplicationRequest;
import tn.isam.spring.bankSupervision.repository.ApplicationRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application introuvable"));
    }

    public Application addApplication(ApplicationRequest request) {
        Application application = new Application();
        application.setName(request.getName());
        application.setServers(request.getServers());
        application.setVersion(request.getVersion());

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            application.setStatus("Running");
        } else {
            application.setStatus(request.getStatus());
        }

        application.setLastCheck(LocalDateTime.now());
        return applicationRepository.save(application);
    }

    public Application updateApplication(Long id, ApplicationRequest updatedApplication) {
        Application application = getApplicationById(id);

        application.setName(updatedApplication.getName());
        application.setServers(updatedApplication.getServers());
        application.setVersion(updatedApplication.getVersion());

        if (updatedApplication.getStatus() == null || updatedApplication.getStatus().isBlank()) {
            application.setStatus("Running");
        } else {
            application.setStatus(updatedApplication.getStatus());
        }

        application.setLastCheck(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application introuvable");
        }
        applicationRepository.deleteById(id);
    }
}
