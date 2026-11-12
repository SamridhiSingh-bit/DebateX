package com.debatex.backend.service;

import com.debatex.backend.dto.TopicDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TopicService {

    private static final Logger log = LoggerFactory.getLogger(TopicService.class);

    private final ObjectMapper objectMapper;
    private final Map<String, TopicDto> topicMap = new ConcurrentHashMap<>();
    private final List<TopicDto> topicList = new ArrayList<>();

    public TopicService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("topics/topics.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    List<TopicDto> loaded = objectMapper.readValue(is, new TypeReference<List<TopicDto>>() {});
                    for (TopicDto topic : loaded) {
                        topicMap.put(topic.id(), topic);
                        topicList.add(topic);
                    }
                    log.info("Successfully loaded {} curated topics into TopicService.", topicMap.size());
                }
            } else {
                log.warn("topics/topics.json not found on classpath!");
            }
        } catch (Exception e) {
            log.error("Failed to load topics from topics.json", e);
        }
    }

    public List<TopicDto> getAllTopics() {
        return Collections.unmodifiableList(topicList);
    }

    public Optional<TopicDto> getTopicById(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(topicMap.get(id.trim()));
    }

    public boolean isValidTopicId(String id) {
        if (id == null) return false;
        TopicDto topic = topicMap.get(id.trim());
        return topic != null && topic.enabled();
    }
}
