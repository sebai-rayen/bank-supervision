package tn.isam.spring.bankSupervision.service;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import tn.isam.spring.bankSupervision.dto.request.CreateAlertRequest;
import tn.isam.spring.bankSupervision.entity.Alert;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.entity.Server;
import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.repository.AlertRepository;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;
import tn.isam.spring.bankSupervision.repository.ServerRepository;
import tn.isam.spring.bankSupervision.repository.UserRepository;
import tn.isam.spring.bankSupervision.dto.response.AdminAlertResponse;
import tn.isam.spring.bankSupervision.dto.response.UserAlertResponse;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@AllArgsConstructor // constructeur bil parameter
public class AlertService {
    private final AlertRepository repository;
    private final UserRepository userRepository;
    private final PersonneRepository personneRepository;
    private final ServerRepository serverRepository;
    private final AlertEmailService alertEmailService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<String> ISSUE_STATUSES_LOWER = List.of(
            "warning",
            "critical",
            "warn",
            "crit"
    );

    public List<User> getPersonne() {
        return userRepository.findAll();
    }

    public AdminAlertResponse getAdminAlerts() {
        List<Alert> alerts = repository.findIssueAlerts(ISSUE_STATUSES_LOWER);
        if (alerts == null || alerts.isEmpty()) {
            alerts = repository.findNonHealthyAlerts("online");
        }

        AdminAlertResponse response = new AdminAlertResponse();
        response.setLatest(buildLatest(alerts));
        response.setAlerts(alerts.stream().map(this::toReceivedAlert).toList());
        response.setSentAlerts(repository.findSentAlertsOrderByDateDesc().stream().map(this::toUserAlertResponse).toList());
        return response;
    }

    @Transactional
    public UserAlertResponse createAlert(CreateAlertRequest request) {
        Personne recipient = personneRepository.findByEmail(request.getRecipientEmail().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur destinataire introuvable"));

        Server server = serverRepository.findByNameIgnoreCase(request.getServer().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serveur introuvable"));

        Alert alert = new Alert();
        alert.setServer(server);
        alert.setDestinataire(recipient);
        alert.setType(request.getType().trim());
        alert.setSubject(request.getSubject().trim());
        alert.setSeverity(normalizeSeverity(request.getSeverity()));
        alert.setMessage(request.getMessage().trim());
        alert.setDate(LocalDateTime.now());

        Alert savedAlert = repository.save(alert);

        try {
            alertEmailService.sendAlertEmail(savedAlert);
        } catch (MailException ex) {
            // Keep the in-app alert available even if SMTP delivery fails.
        }

        return toUserAlertResponse(savedAlert);
    }

    public List<UserAlertResponse> getCurrentUserAlerts() {
        String email = getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            return List.of();
        }

        return repository.findAllByDestinataireEmailIgnoreCaseOrderByDateDesc(email).stream()
                .map(this::toUserAlertResponse)
                .toList();
    }

    public Optional<AdminAlertResponse.IncomingAlert> getLatestAdminAlert() {
        List<Alert> alerts = repository.findIssueAlerts(ISSUE_STATUSES_LOWER);
        if (alerts == null || alerts.isEmpty()) {
            alerts = repository.findNonHealthyAlerts("online");
        }
        if (alerts == null || alerts.isEmpty()) {
            return Optional.empty();
        }
        return Optional.ofNullable(alerts.get(0)).map(this::toIncomingAlert);
    }

    private AdminAlertResponse.IncomingAlert buildLatest(List<Alert> alerts) {
        if (alerts == null || alerts.isEmpty()) {
            return null;
        }
        return toIncomingAlert(alerts.get(0));
    }

    private AdminAlertResponse.IncomingAlert toIncomingAlert(Alert alert) {
        AdminAlertResponse.IncomingAlert dto = new AdminAlertResponse.IncomingAlert();
        dto.setId(alert.getId());
        dto.setServer(alert.getServer() != null ? nullSafe(alert.getServer().getName(), "-") : "-");
        dto.setSubject(nullSafe(alert.getSubject(), buildSubject(alert)));
        dto.setMessage(nullSafe(alert.getMessage(), "-"));
        dto.setTime(formatTime(alert.getDate()));
        dto.setSeverity(resolveSeverity(alert));
        return dto;
    }

    private AdminAlertResponse.ReceivedAlert toReceivedAlert(Alert alert) {
        AdminAlertResponse.ReceivedAlert dto = new AdminAlertResponse.ReceivedAlert();
        dto.setId(alert.getId());
        dto.setServer(alert.getServer() != null ? nullSafe(alert.getServer().getName(), "-") : "-");
        dto.setType(nullSafe(alert.getType(), "-"));
        dto.setSeverity(resolveSeverity(alert));
        dto.setEmail(alert.getDestinataire() != null ? nullSafe(alert.getDestinataire().getEmail(), "-") : "-");
        dto.setSubject(nullSafe(alert.getSubject(), buildSubject(alert)));
        dto.setTime(formatTime(alert.getDate()));
        dto.setMessage(nullSafe(alert.getMessage(), ""));
        return dto;
    }

    private UserAlertResponse toUserAlertResponse(Alert alert) {
        UserAlertResponse dto = new UserAlertResponse();
        dto.setId(alert.getId());
        dto.setServer(alert.getServer() != null ? nullSafe(alert.getServer().getName(), "-") : "-");
        dto.setType(nullSafe(alert.getType(), "-"));
        dto.setSeverity(resolveSeverity(alert));
        dto.setSubject(nullSafe(alert.getSubject(), buildSubject(alert)));
        dto.setMessage(nullSafe(alert.getMessage(), ""));
        dto.setRecipientEmail(alert.getDestinataire() != null ? nullSafe(alert.getDestinataire().getEmail(), "-") : "-");
        dto.setRecipientName(alert.getDestinataire() != null ? nullSafe(alert.getDestinataire().getNom(), "Utilisateur") : "Utilisateur");
        dto.setSentBy(resolveSender());
        dto.setTime(formatTime(alert.getDate()));
        dto.setCreatedAt(alert.getDate() != null
                ? alert.getDate().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                : null);
        return dto;
    }

    private String resolveSeverity(Alert alert) {
        if (alert == null) {
            return "Warning";
        }

        if (alert.getSeverity() != null && !alert.getSeverity().isBlank()) {
            return normalizeSeverity(alert.getSeverity());
        }

        if (alert.getServer() == null) {
            return "Warning";
        }

        String status = alert.getServer().getStatus();
        if (status == null) {
            return "Warning";
        }

        String normalized = status.toLowerCase(Locale.ROOT);
        if (normalized.contains("crit")) {
            return "Critical";
        }

        return "Warning";
    }

    private String buildSubject(Alert alert) {
        String type = alert != null ? alert.getType() : null;
        if (type == null || type.isBlank()) {
            return "Server Alert";
        }
        return type + " Alert";
    }

    private String normalizeSeverity(String value) {
        if (value == null) {
            return "Warning";
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("crit")) {
            return "Critical";
        }

        return "Warning";
    }

    private String formatTime(LocalDateTime value) {
        if (value == null) {
            return "--:--";
        }
        return TIME_FORMATTER.format(value);
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Personne personne) {
            return personne.getEmail();
        }

        return authentication.getName();
    }

    private String resolveSender() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Personne personne) {
            return nullSafe(personne.getNom(), "Admin");
        }
        return "Admin";
    }

    private String nullSafe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
