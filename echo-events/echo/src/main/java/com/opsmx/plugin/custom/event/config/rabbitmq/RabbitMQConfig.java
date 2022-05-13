package com.opsmx.plugin.custom.event.config.rabbitmq;

import com.netflix.spinnaker.kork.plugins.api.spring.ExposeToApp;
import com.opsmx.plugin.custom.event.config.CamelRouteConfig;
import com.opsmx.plugin.custom.event.config.MessageBrokerConfig;
import com.opsmx.plugin.custom.event.config.SpinnakerConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@ExposeToApp
@Configuration
@ConditionalOnProperty(value = "message-broker.endpoint.name", havingValue = "rabbitmq")
public class RabbitMQConfig implements CamelRouteConfig {


    @Autowired
    private MessageBrokerConfig messageBrokerConfig;

    @Autowired
    private SpinnakerConfig spinnakerConfig;

    private static final String exchange = "echo.events";

    @Override
    public String configure() {

        return messageBrokerConfig.getEndpoint().getName()+":"+exchange+"?queue="
                +spinnakerConfig.getName()+"&autoDelete=false&routingKey="
                +spinnakerConfig.getName()+"&declare=true&durable=true&exchangeType=direct&hostname="
                +messageBrokerConfig.getHost() +"&portNumber="+messageBrokerConfig.getPort()
                +"&username="+messageBrokerConfig.getUsername()+"&password="+messageBrokerConfig.getPassword();
    }
}
