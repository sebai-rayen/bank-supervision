package tn.isam.spring.bankSupervision.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import tn.isam.spring.bankSupervision.entity.Alert;
import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.repository.AlertRepository;
import tn.isam.spring.bankSupervision.repository.UserRepository;
import tn.isam.spring.bankSupervision.dto.response.AdminAlertResponse;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@AllArgsConstructor // constructeur bil parameter
public class AlertService {
    private final AlertRepository repository;
    private final UserRepository userRepository;

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
        return response;
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
        dto.setSubject(buildSubject(alert));
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
        dto.setTime(formatTime(alert.getDate()));
        dto.setMessage(nullSafe(alert.getMessage(), ""));
        return dto;
    }

    private String resolveSeverity(Alert alert) {
        if (alert == null || alert.getServer() == null) {
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

    private String formatTime(LocalDateTime value) {
        if (value == null) {
            return "--:--";
        }
        return TIME_FORMATTER.format(value);
    }

    private String nullSafe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
