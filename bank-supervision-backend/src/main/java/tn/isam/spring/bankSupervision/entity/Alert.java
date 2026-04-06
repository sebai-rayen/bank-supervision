package tn.isam.spring.bankSupervision.entity;

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

    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    @ManyToOne
    @JoinColumn(name = "destinataire_id")
    private Personne destinataire;

    // Getters & Setters
}
