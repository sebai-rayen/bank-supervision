package tn.isam.spring.bankSupervision.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.server.ResponseStatusException;

import tn.isam.spring.bankSupervision.dto.request.RefreshRequest;
import tn.isam.spring.bankSupervision.dto.request.AuthenticationRequest;
import tn.isam.spring.bankSupervision.dto.request.RegistrationRequest;
import tn.isam.spring.bankSupervision.dto.response.AuthenticationResponse;

import tn.isam.spring.bankSupervision.entity.Admin;
import tn.isam.spring.bankSupervision.security.JwtService;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

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
    private final JwtService jwtService;
    private final PersonneRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationResponse login(final AuthenticationRequest request) {
        log.info("[Login] Attempt for email: {}", request.getEmail());

        try {
            // Perform authentication
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Authentication successful
            Personne personne = (Personne) auth.getPrincipal();
            log.info("[Login] Authentication successful for: {}", personne.getEmail());
            final String role = (personne instanceof Admin) ? "ADMIN" : "USER";

            // Generate JWT tokens
            String accessToken = jwtService.generateAccessToken(
                    personne.getUsername(),
                    personne.getNom(),
                    personne.getEmail(),
                    role
            );

            String refreshToken = jwtService.generateRefreshToken(
                    personne.getUsername(),
                    personne.getNom(),
                    personne.getEmail(),
                    role
            );

            log.info("[Login] Tokens generated for: {}", personne.getEmail());

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .role(role)
                    .build();

        } catch (BadCredentialsException ex) {
            log.warn("[Login] Bad credentials for email: {}", request.getEmail());
            // HTTP 401
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");

        } catch (DisabledException ex) {
            log.warn("[Login] Disabled account for email: {}", request.getEmail());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Compte désactivé");

        } catch (InternalAuthenticationServiceException ex) {
            // This usually wraps UsernameNotFoundException
            if (ex.getCause() instanceof UsernameNotFoundException) {
                log.warn("[Login] User not found: {}", request.getEmail());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouvé");
            }
            log.error("[Login] Internal authentication error for {}: {}", request.getEmail(), ex.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur");

        } catch (Exception ex) {
            log.error("[Login] Unexpected error for {}: {}", request.getEmail(), ex.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur");
        }
    }

    @Transactional
    public Personne register(RegistrationRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce compte existe déjà");
        }

        final Personne personne = new User();

        personne.setNom(request.getName());
        personne.setEmail(request.getEmail());
        personne.setPassword(passwordEncoder.encode(request.getPassword()));

        boolean active = request.getActive() == null || request.getActive();
        personne.setActive(active);

        return repository.save(personne);
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


