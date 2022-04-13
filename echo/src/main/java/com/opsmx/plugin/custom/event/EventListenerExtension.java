package com.opsmx.plugin.custom.event;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.spinnaker.echo.api.events.Event;
import com.netflix.spinnaker.echo.api.events.EventListener;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import lombok.extern.slf4j.Slf4j;
import org.pf4j.Extension;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Extension
public class EventListenerExtension implements EventListener {

    private static ObjectMapper mapper = new ObjectMapper();

    @Override
    public void processEvent(Event event) {
        try {
            Map<String, Object> eventMap = mapper.convertValue(event, Map.class);
            log.info("event : {}", event);
            eventMap.put("content", mapper.writeValueAsString(eventMap.get("content")));
            eventMap.put("details", mapper.writeValueAsString(eventMap.get("details")));

            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("localhost");
            factory.setPort(5672);
            try (Connection connection = factory.newConnection();
                 Channel channel = connection.createChannel()) {
                channel.exchangeDeclare("auditTestExchange", "direct");
                String rmqMessage = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(eventMap);




                channel.basicPublish("auditTestExchange", "spinnaker1", null, rmqMessage.getBytes(StandardCharsets.UTF_8));

            }
        }catch (Exception e){
            log.error("Exception occurred while publishing the message to RMQ : {}", e);
        }

    }
}
