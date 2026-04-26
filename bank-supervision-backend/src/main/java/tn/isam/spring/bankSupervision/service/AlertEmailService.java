package tn.isam.spring.bankSupervision.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import tn.isam.spring.bankSupervision.entity.Alert;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.alert.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.alert.mail.from:no-reply@bank-supervision.local}")
    private String fromAddress;

    public void sendAlertEmail(Alert alert) {
        if (!mailEnabled) {
            log.info("Alert email sending is disabled. Alert {} stored for in-app delivery only.", alert.getId());
            return;
        }

        if (alert.getDestinataire() == null || alert.getDestinataire().getEmail() == null || alert.getDestinataire().getEmail().isBlank()) {
            log.warn("Skipping alert email for alert {} because no recipient email is available.", alert.getId());
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(alert.getDestinataire().getEmail());
        message.setSubject(resolveSubject(alert));
        message.setText(buildBody(alert));

        try {
            mailSender.send(message);
            log.info("Alert email sent successfully to {} for alert {}", alert.getDestinataire().getEmail(), alert.getId());
        } catch (MailException ex) {
            log.error("Failed to send alert email for alert {} to {}: {}", alert.getId(), alert.getDestinataire().getEmail(), ex.getMessage());
            throw ex;
        }
    }

    private String resolveSubject(Alert alert) {
        if (alert.getSubject() != null && !alert.getSubject().isBlank()) {
            return alert.getSubject();
        }

        if (alert.getType() != null && !alert.getType().isBlank()) {
            return alert.getType() + " Alert";
        }

        return "Server Alert";
    }

    private String buildBody(Alert alert) {
        String serverName = alert.getServer() != null && alert.getServer().getName() != null
                ? alert.getServer().getName()
                : "-";
        String severity = alert.getSeverity() != null && !alert.getSeverity().isBlank()
                ? alert.getSeverity()
                : "Warning";
        String type = alert.getType() != null && !alert.getType().isBlank()
                ? alert.getType()
                : "General";
        String message = alert.getMessage() != null ? alert.getMessage() : "";

        return """
                A new alert has been assigned to you.

                Server: %s
                Type: %s
                Severity: %s

                Message:
                %s
                """.formatted(serverName, type, severity, message);
    }
}
