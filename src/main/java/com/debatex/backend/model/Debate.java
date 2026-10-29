package com.debatex.backend.model;

public class Debate {
    private Long id;
    private String title;
    private String description;
    private String topic;
    private String creator;
    private String status;
    private int participantCount;
      public Debate() {
    }

    public Debate(Long id, String title, String description,
                  String topic, String creator, String status,
                  int participantCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.topic = topic;
        this.creator = creator;
        this.status = status;
        this.participantCount = participantCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(int participantCount) {
        this.participantCount = participantCount;
    }
}
}
