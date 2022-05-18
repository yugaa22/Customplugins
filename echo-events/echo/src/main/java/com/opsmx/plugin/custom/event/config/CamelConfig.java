package com.opsmx.plugin.custom.event.config;

import com.netflix.spinnaker.kork.plugins.api.spring.ExposeToApp;
import com.opsmx.plugin.custom.event.constants.EchoConstant;
import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@ExposeToApp
@Configuration
@ConditionalOnExpression("${message-broker.enabled:true}")
public class CamelConfig {

    @Autowired
    private CamelRouteConfiguration camelRouteConfiguration;

    @Bean
    @ExposeToApp
    public CamelContext camelContext() throws Exception {
        CamelContext camelContext = new DefaultCamelContext();
        camelContext.addRoutes(camelRouteConfiguration);
        camelContext.start();
        return camelContext;
    }

    @Bean
    @ExposeToApp
    public ProducerTemplate producerTemplate(CamelContext camelContext){
        return camelContext.createProducerTemplate();
    }

    @ExposeToApp
    @Configuration
    @ConditionalOnExpression("${message-broker.enabled:true}")
    public static class CamelRouteConfiguration extends RouteBuilder{

        @Autowired
        private CamelRouteConfig camelRouteConfig;

        @Override
        public void configure() throws Exception {
            from(EchoConstant.echoEventDirectEndPointUrl).id(EchoConstant.eventQueueId)
                    .to(camelRouteConfig.configure()).end();
        }
    }

}
