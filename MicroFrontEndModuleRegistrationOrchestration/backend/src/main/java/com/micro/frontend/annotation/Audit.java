package com.micro.frontend.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Audit {

    String operationType();

    String module();

    String targetTable() default "";

    String description() default "";
}
