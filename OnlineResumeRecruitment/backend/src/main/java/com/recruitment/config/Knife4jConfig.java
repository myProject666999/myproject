package com.recruitment.config;

import com.github.xiaoymin.knife4j.spring.annotations.EnableKnife4j;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.schema.ModelRef;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.service.Parameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableSwagger2
@EnableKnife4j
public class Knife4jConfig {

    @Value("${knife4j.openapi.title}")
    private String title;

    @Value("${knife4j.openapi.description}")
    private String description;

    @Value("${knife4j.openapi.version}")
    private String version;

    @Value("${knife4j.openapi.concat}")
    private String contact;

    @Bean
    public Docket defaultApi() {
        return new Docket(DocumentationType.SWAGGER_2)
            .apiInfo(apiInfo())
            .groupName("全部接口")
            .select()
            .apis(RequestHandlerSelectors.withMethodAnnotation(ApiOperation.class))
            .paths(PathSelectors.any())
            .build()
            .globalOperationParameters(globalParameters());
    }

    @Bean
    public Docket jobSeekerApi() {
        return new Docket(DocumentationType.SWAGGER_2)
            .apiInfo(apiInfo())
            .groupName("求职者接口")
            .select()
            .apis(RequestHandlerSelectors.withMethodAnnotation(ApiOperation.class))
            .paths(PathSelectors.regex(".*/job.*|.*/resume.*|.*/application.*|.*/favorite.*"))
            .build()
            .globalOperationParameters(globalParameters());
    }

    @Bean
    public Docket hrApi() {
        return new Docket(DocumentationType.SWAGGER_2)
            .apiInfo(apiInfo())
            .groupName("HR接口")
            .select()
            .apis(RequestHandlerSelectors.withMethodAnnotation(ApiOperation.class))
            .paths(PathSelectors.regex(".*/company.*|.*/job.*|.*/application.*|.*/hr.*"))
            .build()
            .globalOperationParameters(globalParameters());
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
            .title(title)
            .description(description)
            .version(version)
            .contact(new Contact(contact, "", ""))
            .build();
    }

    private List<Parameter> globalParameters() {
        List<Parameter> parameters = new ArrayList<>();
        ParameterBuilder parameterBuilder = new ParameterBuilder();
        parameterBuilder.name("Authorization")
            .description("JWT令牌，格式: Bearer {token}")
            .modelRef(new ModelRef("string"))
            .parameterType("header")
            .required(false)
            .defaultValue("Bearer ");
        parameters.add(parameterBuilder.build());
        return parameters;
    }
}
