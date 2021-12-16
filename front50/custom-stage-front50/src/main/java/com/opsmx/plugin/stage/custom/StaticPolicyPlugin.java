package com.opsmx.plugin.stage.custom;

import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StaticPolicyPlugin extends Plugin {

    private final Logger log = LoggerFactory.getLogger(getClass());
  	
    public StaticPolicyPlugin(PluginWrapper wrapper) {
        super(wrapper);
    }

    public void start() {
        log.info("Static Policy plugin start()");
    }

    public void stop() {
        log.info("Static Policy plugin stop()");
    }
}