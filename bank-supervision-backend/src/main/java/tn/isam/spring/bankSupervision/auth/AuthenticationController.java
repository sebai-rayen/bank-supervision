package tn.isam.spring.bankSupervision.auth;

import tn.isam.spring.bankSupervision.auth.response.AuthenticationResponse;
import tn.isam.spring.bankSupervision.auth.request.AuthenticationRequest;
import tn.isam.spring.bankSupervision.auth.request.RegistrationRequest;
import tn.isam.spring.bankSupervision.auth.request.RefreshRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor

public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @Valid
            @RequestBody
            final AuthenticationRequest request) {
        return ResponseEntity.ok(this.service.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid
            @RequestBody
            final RegistrationRequest request) {
        this.service.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(
            @RequestBody
            final RefreshRequest req) {
        return ResponseEntity.ok(this.service.refreshToken(req));
    }
}