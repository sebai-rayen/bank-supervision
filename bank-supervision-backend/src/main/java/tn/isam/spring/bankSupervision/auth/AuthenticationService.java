package tn.isam.spring.bankSupervision.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import tn.isam.spring.bankSupervision.auth.request.RefreshRequest;
import tn.isam.spring.bankSupervision.auth.request.AuthenticationRequest;
import tn.isam.spring.bankSupervision.auth.request.RegistrationRequest;
import tn.isam.spring.bankSupervision.auth.response.AuthenticationResponse;

import tn.isam.spring.bankSupervision.entity.Admin;
import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.mapper.PersonneMapper;
import tn.isam.spring.bankSupervision.security.JwtService;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PersonneRepository repository;

    private final PersonneMapper mapper;

    public AuthenticationResponse login(final AuthenticationRequest request) {
        log.info("[Login] Attempt for email: {}", request.getEmail());

        try {
            // Perform authentication
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Authentication successful
            Personne user = (Personne) auth.getPrincipal();
            log.info("[Login] Authentication successful for: {}", user.getEmail());

            // Generate JWT tokens
            String name = jwtService.generateName(user.getUsername());
            String accessToken = jwtService.generateAccessToken(user.getUsername());
            String refreshToken = jwtService.generateRefreshToken(user.getUsername());
            String role = user.getAuthorities().stream()
                                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())) ? "ADMIN" : "USER";

            log.info("[Login] Tokens generated for: {}", user.getEmail());

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .role(role)
                    .name(name)
                    .build();

        } catch (BadCredentialsException ex) {
            log.warn("[Login] Bad credentials for email: {}", request.getEmail());
            // HTTP 401
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");

        } catch (InternalAuthenticationServiceException ex) {
            // This usually wraps UsernameNotFoundException
            if (ex.getCause() instanceof UsernameNotFoundException) {
                log.warn("[Login] User not found: {}", request.getEmail());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouv�");
            }
            log.error("[Login] Internal authentication error for {}: {}", request.getEmail(), ex.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur");

        } catch (Exception ex) {
            log.error("[Login] Unexpected error for {}: {}", request.getEmail(), ex.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur");
        }
    }

    @Transactional
    public void register(RegistrationRequest request) {

        if (repository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce compte existe d�j�");
        }

        Personne personne;

        if ("ADMIN".equalsIgnoreCase(request.getRoleType())) {
            personne = new Admin();
        } else {
            personne = new User();
        }

        // تعيين بيانات الشخص
        personne.setNom(request.getName());
        personne.setEmail(request.getEmail());
        personne.setPassword(passwordEncoder.encode(request.getPassword()));

        // تخزين في قاعدة البيانات (جدول Personne أو جدول Users)
        repository.save(personne);
    }

    public AuthenticationResponse refreshToken(final RefreshRequest req) {
        final String newAccessToken = this.jwtService.refreshAccessToken(req.getRefreshToken());
        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(req.getRefreshToken())
                .tokenType("Bearer")
                .build();
    }


}


