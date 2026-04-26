package tn.isam.spring.bankSupervision.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataAccessException;
import org.springframework.web.server.ResponseStatusException;
import tn.isam.spring.bankSupervision.entity.Application;
import tn.isam.spring.bankSupervision.dto.request.ApplicationRequest;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.repository.ApplicationRepository;
import tn.isam.spring.bankSupervision.entity.Server;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;
import tn.isam.spring.bankSupervision.repository.ServerRepository;
import tn.isam.spring.bankSupervision.entity.User;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ServerRepository serverRepository;
    private final PersonneRepository personneRepository;

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Personne> getUsersForAssignment() {
        return personneRepository.findAllUsersOnly();
    }

    public List<Application> getMyApplications() {
        String email = getCurrentUserEmail();
        return applicationRepository.findAllByUser_EmailOrderByLastCheckDesc(email);
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application introuvable"));
    }

    @Transactional
    public Application addApplication(ApplicationRequest request) {
        log.info("[ApplicationService] Adding application: {}", request.getName());
        Server server = resolveServer(request);
        
        Application application = new Application();
        application.setName(normalizeRequired(request.getName(), "Nom d'application requis"));
        application.setServer(server);
        application.setVersion(normalizeRequired(request.getVersion(), "Version requise"));
        application.setStatus(normalizeStatus(request.getStatus()));

        application.setLastCheck(LocalDateTime.now());

        if (request.getAssignedUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'utilisateur assigné est obligatoire");
        }

        Personne assignedUser = personneRepository.findById(request.getAssignedUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        if (!(assignedUser instanceof User)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une application ne peut être assignée qu'à un utilisateur standard, pas à un administrateur");
        }

        application.setUser(assignedUser);
        
        return saveApplication(application);
    }

    @Transactional
    public Application updateApplication(Long id, ApplicationRequest updatedApplication) {
        Application application = getApplicationById(id);

        application.setName(normalizeRequired(updatedApplication.getName(), "Nom d'application requis"));
        Server server = resolveServer(updatedApplication);
        application.setServer(server);
        application.setVersion(normalizeRequired(updatedApplication.getVersion(), "Version requise"));
        application.setStatus(normalizeStatus(updatedApplication.getStatus()));

        application.setLastCheck(LocalDateTime.now());

        return saveApplication(application);
    }

    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application introuvable");
        }
        applicationRepository.deleteById(id);
    }

    private Server resolveServer(ApplicationRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requête invalide");
        }

        if (request.getServerId() != null) {
            return serverRepository.findById(request.getServerId())
                    .orElseThrow(() -> {
                        log.warn("[ApplicationService] Server ID not found: {}", request.getServerId());
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Serveur introuvable (ID: " + request.getServerId() + ")");
                    });
        }

        String serverName = request.getServers();
        if (serverName != null && !serverName.isBlank()) {
            String trimmedName = serverName.trim();
            return serverRepository.findByNameIgnoreCase(trimmedName)
                    .orElseThrow(() -> {
                        log.warn("[ApplicationService] Server Name not found: '{}'", trimmedName);
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Serveur introuvable (Nom: " + trimmedName + ")");
                    });
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serveur requis");
    }

    private Application saveApplication(Application application) {
        try {
            return applicationRepository.saveAndFlush(application);
        } catch (DataAccessException ex) {
            log.error("[ApplicationService] Failed to save application '{}': {}", application.getName(), ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lors de l'enregistrement de l'application");
        }
    }

    private String getCurrentUserEmail() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        if (principal == null) {
            return null;
        }

        String value = principal.toString();
        return "anonymousUser".equalsIgnoreCase(value) ? null : value;
    }

    private java.util.Optional<Personne> findCurrentUser() {
        String email = getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            return java.util.Optional.empty();
        }

        return personneRepository.findByEmail(email);
    }

    private String normalizeRequired(String value, String errorMessage) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
        return value.trim();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Running";
        }
        return status.trim();
    }
}
