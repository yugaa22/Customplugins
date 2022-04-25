package com.opsmx.plugin.custom.event.config;

import com.netflix.spinnaker.kork.plugins.api.spring.ExposeToApp;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;


@ExposeToApp
@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "message-broker")
public class MessageBrokerConfig {

    private String username;
    private String password;
    private String host;
    private String port;
    private Endpoint endpoint;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public Endpoint getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(Endpoint endpoint) {
        this.endpoint = endpoint;
    }

    @ExposeToApp
    @Configuration
    @EnableConfigurationProperties
    @ConfigurationProperties(prefix = "message-broker.endpoint")
    public static class Endpoint{

        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
