package com.opsmx.plugin.custom.event;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;

@Slf4j
public class CustomEchoPlugin extends Plugin {

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
        log.info("CustomEchoPlugin.start()");
    }

    public void stop() {
        log.info("CustomEchoPlugin.stop()");
    }
}