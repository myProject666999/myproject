package com.restaurant.websocket;

import com.restaurant.dto.OrderVO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
public class OrderWebSocketHandler extends TextWebSocketHandler {
    
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("WebSocket连接建立, 总数: {}", sessions.size());
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("WebSocket连接关闭, 总数: {}", sessions.size());
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        log.debug("收到消息: {}", message.getPayload());
    }
    
    public void broadcastNewOrder(OrderVO order) {
        broadcast("NEW_ORDER", order);
    }
    
    public void broadcastOrderUpdate(OrderVO order) {
        broadcast("ORDER_UPDATE", order);
    }
    
    private void broadcast(String type, Object data) {
        try {
            String json = objectMapper.writeValueAsString(new WebSocketMessage(type, data));
            TextMessage message = new TextMessage(json);
            
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        log.error("发送WebSocket消息失败", e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("广播消息失败", e);
        }
    }
    
    private static class WebSocketMessage {
        private String type;
        private Object data;
        
        public WebSocketMessage(String type, Object data) {
            this.type = type;
            this.data = data;
        }
        
        public String getType() { return type; }
        public Object getData() { return data; }
    }
}
