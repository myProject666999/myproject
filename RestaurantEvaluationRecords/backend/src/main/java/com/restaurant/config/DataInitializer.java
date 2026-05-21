package com.restaurant.config;

import com.restaurant.entity.*;
import com.restaurant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRelationRepository friendRelationRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private RestaurantReviewRepository reviewRepository;

    @Autowired
    private RecommendedDishRepository recommendedDishRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (isDataInitialized()) {
            System.out.println("数据已存在，跳过初始化");
            return;
        }
        dropAndCreateTables();
        initUsers();
        initFriendRelations();
        initRestaurants();
        initReviews();
        initRecommendedDishes();
        updateRestaurantScores();
        System.out.println("数据初始化完成！");
    }

    private boolean isDataInitialized() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM `user` WHERE username = ?",
                    Integer.class,
                    "zhangsan"
            );
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private void dropAndCreateTables() {
        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("DROP TABLE IF EXISTS recommended_dish");
            jdbcTemplate.execute("DROP TABLE IF EXISTS friend_relation");
            jdbcTemplate.execute("DROP TABLE IF EXISTS restaurant_review");
            jdbcTemplate.execute("DROP TABLE IF EXISTS `restaurant`");
            jdbcTemplate.execute("DROP TABLE IF EXISTS `user`");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            System.out.println("旧表删除完成");
        } catch (Exception e) {
            System.out.println("删除旧表警告: " + e.getMessage());
        }

        jdbcTemplate.execute("CREATE TABLE `user` (" +
                "id BIGINT NOT NULL AUTO_INCREMENT, " +
                "username VARCHAR(50) NOT NULL UNIQUE, " +
                "password VARCHAR(255) NOT NULL, " +
                "nickname VARCHAR(50) NOT NULL, " +
                "avatar VARCHAR(255), " +
                "create_time DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (id)) ENGINE=InnoDB");

        jdbcTemplate.execute("CREATE TABLE `restaurant` (" +
                "id BIGINT NOT NULL AUTO_INCREMENT, " +
                "name VARCHAR(100) NOT NULL, " +
                "address VARCHAR(255), " +
                "phone VARCHAR(20), " +
                "cuisine_type VARCHAR(50), " +
                "price_range VARCHAR(20), " +
                "cover_image VARCHAR(255), " +
                "avg_taste_score DECIMAL(3,1) DEFAULT 0, " +
                "avg_env_score DECIMAL(3,1) DEFAULT 0, " +
                "avg_service_score DECIMAL(3,1) DEFAULT 0, " +
                "avg_overall_score DECIMAL(3,1) DEFAULT 0, " +
                "review_count INT DEFAULT 0, " +
                "create_time DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (id)) ENGINE=InnoDB");

        jdbcTemplate.execute("CREATE TABLE restaurant_review (" +
                "id BIGINT NOT NULL AUTO_INCREMENT, " +
                "user_id BIGINT NOT NULL, " +
                "restaurant_id BIGINT NOT NULL, " +
                "taste_score INT NOT NULL, " +
                "env_score INT NOT NULL, " +
                "service_score INT NOT NULL, " +
                "overall_score DECIMAL(3,1) NOT NULL, " +
                "repurchase_willingness INT NOT NULL, " +
                "content TEXT, " +
                "visit_date DATE, " +
                "create_time DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (id), " +
                "UNIQUE KEY uk_user_restaurant (user_id, restaurant_id), " +
                "KEY idx_restaurant_id (restaurant_id)) ENGINE=InnoDB");

        jdbcTemplate.execute("CREATE TABLE recommended_dish (" +
                "id BIGINT NOT NULL AUTO_INCREMENT, " +
                "review_id BIGINT NOT NULL, " +
                "user_id BIGINT NOT NULL, " +
                "restaurant_id BIGINT NOT NULL, " +
                "dish_name VARCHAR(100) NOT NULL, " +
                "create_time DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (id), " +
                "KEY idx_restaurant_id (restaurant_id)) ENGINE=InnoDB");

        jdbcTemplate.execute("CREATE TABLE friend_relation (" +
                "id BIGINT NOT NULL AUTO_INCREMENT, " +
                "user_id BIGINT NOT NULL, " +
                "friend_id BIGINT NOT NULL, " +
                "status INT DEFAULT 1, " +
                "create_time DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (id), " +
                "UNIQUE KEY uk_user_friend (user_id, friend_id)) ENGINE=InnoDB");

        System.out.println("新表创建完成");
    }

    private void initUsers() {
        User user1 = new User();
        user1.setUsername("zhangsan");
        user1.setPassword("123456");
        user1.setNickname("张三");
        userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("lisi");
        user2.setPassword("123456");
        user2.setNickname("李四");
        userRepository.save(user2);

        User user3 = new User();
        user3.setUsername("wangwu");
        user3.setPassword("123456");
        user3.setNickname("王五");
        userRepository.save(user3);
    }

    private void initFriendRelations() {
        addFriendRelation(1L, 2L);
        addFriendRelation(2L, 1L);
        addFriendRelation(1L, 3L);
        addFriendRelation(3L, 1L);
        addFriendRelation(2L, 3L);
        addFriendRelation(3L, 2L);
    }

    private void addFriendRelation(Long userId, Long friendId) {
        FriendRelation relation = new FriendRelation();
        relation.setUserId(userId);
        relation.setFriendId(friendId);
        relation.setStatus(1);
        friendRelationRepository.save(relation);
    }

    private void initRestaurants() {
        Restaurant r1 = new Restaurant();
        r1.setName("海底捞火锅");
        r1.setAddress("北京市朝阳区建国路88号");
        r1.setPhone("010-12345678");
        r1.setCuisineType("火锅");
        r1.setPriceRange("¥100-200");
        restaurantRepository.save(r1);

        Restaurant r2 = new Restaurant();
        r2.setName("外婆家");
        r2.setAddress("北京市海淀区中关村大街1号");
        r2.setPhone("010-87654321");
        r2.setCuisineType("江浙菜");
        r2.setPriceRange("¥50-100");
        restaurantRepository.save(r2);

        Restaurant r3 = new Restaurant();
        r3.setName("西贝莜面村");
        r3.setAddress("北京市西城区西单北大街100号");
        r3.setPhone("010-11112222");
        r3.setCuisineType("西北菜");
        r3.setPriceRange("¥80-150");
        restaurantRepository.save(r3);
    }

    private void initReviews() {
        addReview(1L, 1L, 5, 4, 5, 3, "服务真的没得说，味道也很棒！", LocalDate.of(2024, 1, 15));
        addReview(2L, 1L, 4, 5, 5, 3, "环境很好，服务一流", LocalDate.of(2024, 1, 20));
        addReview(1L, 2L, 4, 3, 4, 2, "性价比不错，适合朋友聚餐", LocalDate.of(2024, 2, 1));
        addReview(3L, 2L, 5, 4, 3, 2, "味道很地道", LocalDate.of(2024, 2, 5));
        addReview(2L, 3L, 4, 4, 4, 3, "西北风味很正宗", LocalDate.of(2024, 2, 10));
        addReview(3L, 3L, 5, 3, 4, 2, "肉夹馍特别好吃", LocalDate.of(2024, 2, 12));
    }

    private void addReview(Long userId, Long restaurantId, int taste, int env, int service, int repurchase, String content, LocalDate visitDate) {
        RestaurantReview review = new RestaurantReview();
        review.setUserId(userId);
        review.setRestaurantId(restaurantId);
        review.setTasteScore(taste);
        review.setEnvScore(env);
        review.setServiceScore(service);
        review.setOverallScore(BigDecimal.valueOf((taste + env + service) / 3.0).setScale(1, BigDecimal.ROUND_HALF_UP));
        review.setRepurchaseWillingness(repurchase);
        review.setContent(content);
        review.setVisitDate(visitDate);
        reviewRepository.save(review);
    }

    private void initRecommendedDishes() {
        addDish(1L, 1L, 1L, "番茄锅底");
        addDish(1L, 1L, 1L, "毛肚");
        addDish(2L, 2L, 1L, "虾滑");
        addDish(3L, 1L, 2L, "红烧肉");
        addDish(4L, 3L, 2L, "东坡肉");
        addDish(5L, 2L, 3L, "莜面");
        addDish(6L, 3L, 3L, "肉夹馍");
    }

    private void addDish(Long reviewId, Long userId, Long restaurantId, String dishName) {
        RecommendedDish dish = new RecommendedDish();
        dish.setReviewId(reviewId);
        dish.setUserId(userId);
        dish.setRestaurantId(restaurantId);
        dish.setDishName(dishName);
        recommendedDishRepository.save(dish);
    }

    private void updateRestaurantScores() {
        for (long i = 1; i <= 3; i++) {
            Double avgTaste = reviewRepository.getAvgTasteScore(i);
            Double avgEnv = reviewRepository.getAvgEnvScore(i);
            Double avgService = reviewRepository.getAvgServiceScore(i);
            Double avgOverall = reviewRepository.getAvgOverallScore(i);
            Integer count = reviewRepository.getReviewCount(i);

            final long id = i;
            restaurantRepository.findById(id).ifPresent(r -> {
                r.setAvgTasteScore(avgTaste != null ? BigDecimal.valueOf(avgTaste) : BigDecimal.ZERO);
                r.setAvgEnvScore(avgEnv != null ? BigDecimal.valueOf(avgEnv) : BigDecimal.ZERO);
                r.setAvgServiceScore(avgService != null ? BigDecimal.valueOf(avgService) : BigDecimal.ZERO);
                r.setAvgOverallScore(avgOverall != null ? BigDecimal.valueOf(avgOverall) : BigDecimal.ZERO);
                r.setReviewCount(count != null ? count : 0);
                restaurantRepository.save(r);
            });
        }
    }
}
