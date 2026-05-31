package com.micro.frontend.service;

import com.micro.frontend.entity.AppDependency;

import java.util.List;
import java.util.Map;

public interface IDependencyService {

    AppDependency getById(Long id);

    List<AppDependency> getByAppId(Long appId);

    List<AppDependency> getByAppVersionId(Long appVersionId);

    List<AppDependency> getByDependencyCode(String dependencyCode);

    boolean save(AppDependency dependency);

    boolean update(AppDependency dependency);

    boolean delete(Long id);

    boolean deleteByAppVersionId(Long appVersionId);

    Map<String, Object> validate(Long appVersionId);

    Map<String, Object> validateAllDependencies(Long appId);
}
