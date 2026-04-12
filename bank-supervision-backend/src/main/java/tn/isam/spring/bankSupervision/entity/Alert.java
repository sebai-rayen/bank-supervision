package tn.isam.spring.bankSupervision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String message;

    private LocalDateTime date;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "destinataire_id")
    private Personne destinataire;

    // Getters & Setters
}
