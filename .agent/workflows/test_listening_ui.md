---
description: Testing the 4-Part Listening Admin UI
---

1. Navigate to the Admin Dashboard > Create New Mock Test.
2. Advance to Step 2: Listening.
3. Verify that there are 4 tabs: Part 1, Part 2, Part 3, and Part 4.
4. Click through each tab to ensure the content updates correctly.
5. In Part 1:
   - Add a Title (e.g., "Conversation").
   - Add a dummy Audio URL.
   - Add a Question (MCQ).
   - Enter Question Text and Options.
6. In Part 2:
   - Switch to the Part 2 tab.
   - Verify fields are empty (or default).
   - Add a Title ("Monologue").
   - Add a Map Labeling Question.
   - Add an Image URL.
7. Save the Mock Test.
8. Verify in the database (or by creating the test) that the structure saved is:
   ```json
   {
     "listening": {
       "parts": [
         { "partNumber": 1, ... },
         { "partNumber": 2, ... },
         { "partNumber": 3, ... },
         { "partNumber": 4, ... }
       ]
     }
   }
   ```
