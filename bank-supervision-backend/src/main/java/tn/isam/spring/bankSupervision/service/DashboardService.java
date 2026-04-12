package tn.isam.spring.bankSupervision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.isam.spring.bankSupervision.auth.request.DashboardRequest;
import tn.isam.spring.bankSupervision.entity.Application;
import tn.isam.spring.bankSupervision.entity.Metric;
import tn.isam.spring.bankSupervision.entity.Server;
import tn.isam.spring.bankSupervision.repository.ApplicationRepository;
import tn.isam.spring.bankSupervision.repository.MetricRepository;
import tn.isam.spring.bankSupervision.repository.ServerRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ServerRepository serverRepository;
    private final ApplicationRepository applicationRepository;
    private final MetricRepository metricRepository;

    public DashboardRequest getDashboard() {
        List<Server> servers = serverRepository.findAll();

        DashboardRequest response = new DashboardRequest();
        response.setTotalServers(servers.size());
        response.setActiveServers(countByStatus(servers, "ONLINE"));
        response.setWarningServers(countByStatus(servers, "WARNING"));
        response.setCriticalServers(countByStatus(servers, "CRITICAL"));

        response.setRecentServers(buildRecentServers());
        response.setRecentApplications(buildRecentApplications());
        response.setServerMetrics(buildServerMetrics(servers));

        return response;
    }

    private int countByStatus(List<Server> servers, String status) {
        return (int) servers.stream()
                .filter(server -> status.equalsIgnoreCase(nullSafe(server.getStatus())))
                .count();
    }

    private List<DashboardRequest.ServerRow> buildRecentServers() {
        List<Server> servers = serverRepository.findAllByOrderByLastCheckDesc();
        List<DashboardRequest.ServerRow> rows = new ArrayList<>();

        for (Server server : servers) {
            DashboardRequest.ServerRow row = new DashboardRequest.ServerRow();
            row.setServer(nullSafe(server.getName(), "-"));
            row.setIpAddress(nullSafe(server.getIpAddress(), "-"));
            row.setStatus(nullSafe(server.getStatus(), "UNKNOWN"));
            row.setTime(formatTime(server.getLastCheck()));
            rows.add(row);
        }

        return rows;
    }

    private List<DashboardRequest.ApplicationRow> buildRecentApplications() {
        List<Application> applications = applicationRepository.findAllByOrderByLastCheckDesc();
        List<DashboardRequest.ApplicationRow> rows = new ArrayList<>();

        for (Application application : applications) {
            DashboardRequest.ApplicationRow row = new DashboardRequest.ApplicationRow();
            row.setApp(nullSafe(application.getName(), "Application"));
            row.setType(nullSafe(application.getStatus(), "Status"));
            row.setSeverity(resolveApplicationSeverity(application.getStatus()));
            row.setTime(formatTime(application.getLastCheck()));
            rows.add(row);
        }

        return rows;
    }

    private List<DashboardRequest.ServerMetric> buildServerMetrics(List<Server> servers) {
        List<Metric> metrics = metricRepository.findAll();
        Map<Long, Metric> latestByServer = new HashMap<>();

        for (Metric metric : metrics) {
            if (metric.getServer() == null || metric.getServer().getId() == null) {
                continue;
            }

            Long serverId = metric.getServer().getId();
            Metric current = latestByServer.get(serverId);
            if (current == null || isAfter(metric.getTimestamp(), current.getTimestamp())) {
                latestByServer.put(serverId, metric);
            }
        }

        List<DashboardRequest.ServerMetric> rows = new ArrayList<>();
        servers.stream()
                .sorted(Comparator.comparing(server -> nullSafe(server.getName())))
                .forEach(server -> {
                    Metric metric = latestByServer.get(server.getId());

                    DashboardRequest.ServerMetric row = new DashboardRequest.ServerMetric();
                    row.setName(nullSafe(server.getName(), "Serveur"));
                    row.setCpu(metric != null ? clampPercent(metric.getCpuUsage()) : 0);
                    row.setRam(metric != null ? clampPercent(metric.getRamUsage()) : 0);
                    rows.add(row);
                });

        return rows;
    }

    private String resolveApplicationSeverity(String status) {
        if (status == null) {
            return "Warning";
        }

        String normalized = status.toLowerCase(Locale.ROOT);
        if (normalized.contains("crit")
                || normalized.contains("down")
                || normalized.contains("fail")
                || normalized.contains("error")
                || normalized.contains("stop")) {
            return "Critical";
        }

        return "Warning";
    }

    private boolean isAfter(LocalDateTime first, LocalDateTime second) {
        if (first == null) return false;
        if (second == null) return true;
        return first.isAfter(second);
    }

    private String formatTime(LocalDateTime value) {
        if (value == null) {
            return "--:--";
        }
        return TIME_FORMATTER.format(value);
    }

    private int clampPercent(float value) {
        int rounded = Math.round(value);
        if (rounded < 0) return 0;
        if (rounded > 100) return 100;
        return rounded;
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private String nullSafe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
