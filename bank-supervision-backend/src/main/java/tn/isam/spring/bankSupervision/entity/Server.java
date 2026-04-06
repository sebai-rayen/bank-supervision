package tn.isam.spring.bankSupervision.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Server {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String ipAddress;
    private String status;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL)
    private List<Application> applications;

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL)
    private List<Metric> metrics;

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL)
    private List<Alert> alerts;

    // Getters & Setters
}
