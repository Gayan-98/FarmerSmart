package com.research.farmer_smart.config;

import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

public class MongoConfig {
    @Bean
    public MongoTemplate mongoTemplate() {

        String connectionString = "mongodb+srv://Isuru:Farmer123@research.v5tuo.mongodb.net/research?retryWrites=true&w=majority&appName=farmer_smart_db";
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(connectionString));
    }
}
