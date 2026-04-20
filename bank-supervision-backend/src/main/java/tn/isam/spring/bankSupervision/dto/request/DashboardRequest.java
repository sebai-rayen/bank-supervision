package tn.isam.spring.bankSupervision.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DashboardRequest {

    private int totalServers;
    private int activeServers;
    private int warningServers;
    private int criticalServers;
    private List<ServerRow> recentServers;
    private List<ApplicationRow> recentApplications;
    private List<ServerMetric> serverMetrics;

    @Getter
    @Setter
    public static class ServerRow {
        private String server;
        private String ipAddress;
        private String status;
        private String time;
    }

    @Getter
    @Setter
    public static class ApplicationRow {
        private String app;
        private String type;
        private String severity;
        private String time;
    }

    @Getter
    @Setter
    public static class ServerMetric {
        private String name;
        private int cpu;
        private int ram;
    }
}
