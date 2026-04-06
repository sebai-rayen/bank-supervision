package tn.isam.spring.bankSupervision.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Application  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String status;

    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL)
    private List<Alert> alerts;

    // Getters & Setters
}
