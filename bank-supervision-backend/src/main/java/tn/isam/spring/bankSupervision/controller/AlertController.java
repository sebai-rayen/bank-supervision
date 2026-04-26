package tn.isam.spring.bankSupervision.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import tn.isam.spring.bankSupervision.dto.request.CreateAlertRequest;
import tn.isam.spring.bankSupervision.dto.response.AdminAlertResponse;
import tn.isam.spring.bankSupervision.dto.response.UserAlertResponse;
import tn.isam.spring.bankSupervision.service.AlertService;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserAlertResponse createAlert(@Valid @RequestBody CreateAlertRequest request) {
        return alertService.createAlert(request);
    }

    @GetMapping("/my")
    public List<UserAlertResponse> getMyAlerts() {
        return alertService.getCurrentUserAlerts();
    }
}

