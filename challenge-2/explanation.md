# Challenge 2 Solution Explanation

## Your Solution
*Please explain your approach to solving this challenge*

- Sql query is added before create forign query to check if all Sender/Receiver are exists in users, since if a query added without checking it always through errors


## Database Relationship Fix
*How did you fix the foreign key relationships?*

- Make the non exist sender/receiver as null
- Add forign keys

## API Query Fix
*How did you update the API query to work with the new relationships?*

- on Select the key id is being used to tell DB to use which key for what fields

## Error Handling Strategy
*How did you handle different error scenarios?*

- A common Error response is being used for all response type so there is not any confusion, All APo Response will have same response type

## TypeScript Implementation
*How did you implement proper TypeScript types?*

- For each Response type it is deinfed
- For Error and success a merged type is being used

## Testing Approach
*How did you test your solution?*

- Test cases are being implemented

## Time Taken
*How long did this challenge take you to complete?*

- 1 hour

## Questions or Clarifications
*Any questions about the requirements or suggestions for improvement?*
