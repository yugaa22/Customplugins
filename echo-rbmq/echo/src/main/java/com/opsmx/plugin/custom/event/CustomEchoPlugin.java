package com.opsmx.plugin.custom.event;

import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



public class CustomEchoPlugin extends Plugin {

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

    public void start() {
        logger.info("Custom echo event plugin start");
    }

    public void stop() {
        logger.info("Custom echo event plugin stop");
    }
}