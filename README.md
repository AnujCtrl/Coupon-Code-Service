# Coupon Code Service

## Project Overview

This project is for interview purpose, I was asked to implements a Coupon Code Service that allows for the creation, verification, and application of coupon codes with various usage limits. The service is built using TypeScript and Express.js, providing a RESTful API for coupon management.

## Thought Process

1. **Limit Types**: I was given four types of limits:
   - Global total: The total number of times a coupon can be used across all users
   - User total: The total number of times a single user can use a coupon
   - User daily: The number of times a user can use a coupon per day
   - User weekly: The number of times a user can use a coupon per week
  
2. **Coupon Structure**: Even though I was asked to send the config in the request, I decided to have it as environment variables with default values. Each coupon has:
   - A unique code
   - Multiple repeat count configurations (global total, user total, user daily, and user weekly)
   - A global usage count
   - User-specific usage tracking

3. **Verification Logic**: The `verifyCoupon` method checks all applicable limits before allowing a coupon to be used. This ensures that no limit is exceeded when applying a coupon.

4. **Application Logic**: The `applyCoupon` method first verifies the coupon and then updates the usage counts if the coupon is valid and can be applied. For daily and weekly limits, I implemented methods to calculate the current day and week number. This allows for automatic resetting of these limits when a new day or week starts.

5. **Testing**: I created comprehensive unit tests of all coupon service methods, Not including edge cases and complex scenarios because of time constraint as well as lack of persistance data storage layer it breaks with edge cases.
   1. Currently 2 tests fail, I have kept then to show the limitation of my current testing approach.user total limit tests fail because its always more than daily limit. I have to mock the date to make it pass. Done that for weekly limit, but left it as is for daily to show that I have considered it.

## Assumptions

1. **Unique Coupon Codes**: I assume that each coupon code is unique. An error is thrown if an attempt is made to add a duplicate coupon code.

2. **Limit Values**: We assume that the limit values are set in the environment variables. If not set, they will default to `undefined`, which may cause unexpected behavior.

3. **Time Zones**: For simplicity, we use the server's local time zone for daily and weekly limit calculations. In a production environment, you might want to consider handling different time zones.

4. **Persistence**: This implementation stores coupon data in memory. For a production system, you would likely want to persist this data in a database (Redis).

5. **Concurrency**: The current implementation doesn't handle concurrent requests. In a high-traffic production environment, Redis can be used to handle concurrent requests.

6. **Error Handling**: Basic error handling is implemented. In a production environment, more robust error handling and logging should be added.

## API Endpoints

1. **POST /coupons**: Add a new coupon
2. **GET /coupons/:code/verify**: Verify if a coupon is valid
3. **POST /coupons/:code/apply**: Apply a coupon

## Future Improvements

1. Implement database persistence for coupon data
2. Add more sophisticated error handling and logging
3. Implement user authentication and authorization
4. Add support for different types of coupons (percentage off, fixed amount off, etc.)
5. Implement an admin interface for managing coupons
6. Add support for coupon expiration dates
7. Implement rate limiting to prevent abuse of the API

## Running the Project

1. Install dependencies: `npm install`
2. Set up environment variables (GLOBAL_TOTAL_LIMIT, USER_TOTAL_LIMIT, USER_DAILY_LIMIT, USER_WEEKLY_LIMIT)
3. Run the server: `npm start`
4. Run tests: `npm test`

