package com.opsmx.plugin.custom.event;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.spinnaker.echo.api.events.Event;
import com.netflix.spinnaker.echo.api.events.EventListener;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.nio.charset.StandardCharsets;

@Extension
public class EventListenerExtension implements EventListener {

    private static ObjectMapper mapper = new ObjectMapper();

    private final Logger logger = LoggerFactory.getLogger(EventListenerExtension.class);

    @Override
    public void processEvent(Event event) {
        try {
            logger.info("Event received : {}", event);
            Map<String, Object> eventMap = mapper.convertValue(event, Map.class);
            eventMap.put("content", mapper.writeValueAsString(eventMap.get("content")));
            eventMap.put("details", mapper.writeValueAsString(eventMap.get("details")));

            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("rabbitmq-service");
            factory.setPort(5672);
            factory.setUsername("rabbitmq");
            factory.setPassword("Networks123");
            try (Connection connection = factory.newConnection();
                 Channel channel = connection.createChannel()) {
                channel.exchangeDeclare("auditTestExchange", "direct");
                String rmqMessage = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(eventMap);

                channel.basicPublish("auditTestExchange", "spinnaker1", null, rmqMessage.getBytes(StandardCharsets.UTF_8));

            }
        }catch (Exception e){
            logger.error("Exception occurred while processing event : {}", e);

        }

    }
}
