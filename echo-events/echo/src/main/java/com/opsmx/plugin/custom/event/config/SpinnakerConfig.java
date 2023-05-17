package com.opsmx.plugin.custom.event.config;

import com.netflix.spinnaker.kork.plugins.api.spring.ExposeToApp;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;


@ExposeToApp
@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "spinnaker")
public class SpinnakerConfig {

    private String name;
    private String ssdName;

    public String getSsdName() {
        return ssdName;
    }

    public void setSsdName(String ssdName) {
        this.ssdName = ssdName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
