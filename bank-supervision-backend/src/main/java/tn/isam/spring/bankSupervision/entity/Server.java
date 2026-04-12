package tn.isam.spring.bankSupervision.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@Table(name = "servers")
public class Server {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String ipAddress;
    private Integer port;
    private String os;
    private String system;
    private String status;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @JsonIgnore
    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL)
    private List<Application> applications;

    @JsonIgnore
    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL)
    private List<Metric> metrics;

    @JsonIgnore
    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL)
    private List<Alert> alerts;

    private LocalDateTime lastCheck;
}
