package tn.isam.spring.bankSupervision.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.isam.spring.bankSupervision.dto.request.RegistrationRequest;
import tn.isam.spring.bankSupervision.dto.request.SetActiveRequest;
import tn.isam.spring.bankSupervision.dto.request.UpdateUserRequest;
import tn.isam.spring.bankSupervision.dto.response.PersonneResponse;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.mapper.PersonneMapper;
import tn.isam.spring.bankSupervision.service.PersonneService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PersonneService personneService;
    private final PersonneMapper personneMapper;

    @GetMapping("/users")
    public List<PersonneResponse> listUsers() {
        return personneService.findAllUsers()
                .stream()
                .map(personneMapper::toResponse)
                .toList();
    }

    @PostMapping("/users")
    public ResponseEntity<PersonneResponse> createUser(
            @Valid @RequestBody RegistrationRequest request
    ) {
        Personne created = personneService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(personneMapper.toResponse(created));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<PersonneResponse> updateUser(
            @PathVariable("id") Long userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        try {
            Personne updated = personneService.updatePersonne(
                    userId, request.getNom(), request.getEmail(), request.getActive()
            );
            return ResponseEntity.ok(personneMapper.toResponse(updated));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PatchMapping("/users/{id}/active")
    public ResponseEntity<Void> setActive(
            @PathVariable("id") Long userId,
            @RequestBody SetActiveRequest req
    ) {
        if (req == null || req.getActive() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "`active` est obligatoire");
        }
        personneService.setActive(userId, req.getActive());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long userId) {
        personneService.deleteAccount(userId);
        return ResponseEntity.noContent().build();
    }
}
