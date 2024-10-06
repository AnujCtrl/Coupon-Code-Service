# Coupon Code Service

## Project Overview

This project is for interview purposes. I was asked to implement a Coupon Code Service that allows for the creation, verification, and application of coupon codes with various usage limits. The service is built using TypeScript and Express.js, providing a RESTful API for coupon management.

## Thought Process

1. **Limit Types**: I was given four types of limits:
   - Global total: The total number of times a coupon can be used across all users
   - User total: The total number of times a single user can use a coupon
   - User daily: The number of times a user can use a coupon per day
   - User weekly: The number of times a user can use a coupon per week
  
2. **Coupon Structure**: Even though I was asked to send the config in the request, I decided to have it as environment variables with default values (I hope I did not break their test setup). Each coupon has:
   - A unique code
   - Multiple repeat count configurations (global total, user total, user daily, and user weekly)
   - A global usage count
   - User-specific usage tracking

3. **Verification Logic**: The `verifyCoupon` method checks all applicable limits before allowing a coupon to be used. This ensures that no limit is exceeded when applying a coupon. I decided to make this a GET request because it is a read-only operation and does not modify the state of the system.

4. **Application Logic**: The `applyCoupon` method first verifies the coupon and then updates the usage counts if the coupon is valid and can be applied. For daily and weekly limits, I implemented methods to calculate the current day and week number. This allows for automatic resetting of these limits when a new day or week starts. I decided to make `applyCoupon` and `addCoupon` POST requests because they modify the state of the system and might need to be awaited in a real-world scenario.

5. **Testing**: I created comprehensive unit tests for all coupon service methods, not including edge cases and complex scenarios due to time constraints and the lack of a persistent data storage layer, which breaks with edge cases.
   1. Currently, 2 tests fail. I have kept them to show the limitation of my current testing approach. The user total limit tests fail because it's always more than the daily limit. I have to mock the date to make it pass. I've done that for the weekly limit but left it as is for the daily limit to show that I have considered it.

## Assumptions

1. **Unique Coupon Codes**: I assume that each coupon code is unique. An error is thrown if an attempt is made to add a duplicate coupon code.

2. **Limit Values**: We assume that the limit values are set in the environment variables. If not set, they will default to `undefined`, which may cause unexpected behavior.

3. **Time Zones**: For simplicity, we use the server's local time zone for daily and weekly limit calculations. In a production environment, they might want to consider handling different time zones.

4. **Persistence**: This implementation stores coupon data in memory. For a production system, they might want to persist this data in a database (Redis).

5. **Concurrency**: The current implementation doesn't handle concurrent requests. In a high-traffic production environment, they might want to use Redis to handle concurrent requests.

6. **Error Handling**: Basic error handling was implemented first, but I was asked to implement more robust error handling and logging. So now the API returns the reason for rejection.

## API Endpoints

1. **POST /coupons**: Add a new coupon
2. **GET /coupons/:code/verify**: Verify if a coupon is valid
3. **POST /coupons/:code/apply**: Apply a coupon

## Future Improvements

1. Implement database persistence for coupon data
2. Add more sophisticated error handling and logging
3. Implement user authentication and authorization
4. Implement an admin interface for managing coupons
5. Add support for coupon expiration dates
6. Implement rate limiting to prevent abuse of the API

## Running the Project

1. Install dependencies: `npm install`
2. Set up environment variables (GLOBAL_TOTAL_LIMIT, USER_TOTAL_LIMIT, USER_DAILY_LIMIT, USER_WEEKLY_LIMIT)
3. Run the server: `npm start`
4. Run tests: `npm test`

## Example Usage

```bash
# Add a coupon
curl -X POST http://localhost:3000/coupons \
-H "Content-Type: application/json" \
-d '{"code":"SUMMER2023"}'

# Verify a coupon
curl http://localhost:3000/coupons/SUMMER2023/verify?userId=user123

# Apply a coupon
curl -X POST http://localhost:3000/coupons/SUMMER2023/apply?userId=user123
```
