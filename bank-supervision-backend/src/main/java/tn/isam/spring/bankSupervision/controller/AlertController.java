package tn.isam.spring.bankSupervision.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.isam.spring.bankSupervision.request.AdminAlertResponse;
import tn.isam.spring.bankSupervision.service.AlertService;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public AdminAlertResponse getAdminAlerts() {
        return alertService.getAdminAlerts();
    }

    @GetMapping("/latest")
    public AdminAlertResponse.IncomingAlert latest() {
        return alertService.getLatestAdminAlert().orElse(null);
    }
}

