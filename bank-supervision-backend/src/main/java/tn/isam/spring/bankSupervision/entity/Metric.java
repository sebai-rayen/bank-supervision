package tn.isam.spring.bankSupervision.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Metric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private float cpuUsage;
    private float ramUsage;
    private float diskUsage;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    // Getters & Setters
}
