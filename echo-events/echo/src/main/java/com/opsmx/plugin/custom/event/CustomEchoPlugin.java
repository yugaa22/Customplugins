package com.opsmx.plugin.custom.event;

import com.netflix.spinnaker.kork.plugins.api.spring.SpringLoaderPlugin;
import org.pf4j.PluginWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;


public class CustomEchoPlugin extends SpringLoaderPlugin {

    private final Logger logger = LoggerFactory.getLogger(CustomEchoPlugin.class);

    /**
     * Constructor to be used by plugin manager for plugin instantiation.
     * Your plugins have to provide constructor with this exact signature to
     * be successfully loaded by manager.
     *
     * @param wrapper
     */
    public CustomEchoPlugin(PluginWrapper wrapper) {
        super(wrapper);
    }

    @Override
    public List<String> getPackagesToScan() {
        return Arrays.asList("com.opsmx.plugin.custom.event");
    }

    @Override
    public void start() {
        logger.info("Custom echo event plugin start");
    }

    @Override
    public void stop() {
        logger.info("Custom echo event plugin stop");
    }
}