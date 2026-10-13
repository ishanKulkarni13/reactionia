# Reflex Rush User Guide

Welcome to **Reflex Rush**, a short reaction game created by the IEEE VIT Pune Student Branch.

The game measures how quickly and accurately you can respond to visual signals. A complete run contains three different challenges:

1. **Reaction** - respond as soon as the screen turns green.
2. **Tap Storm** - tap ten targets as quickly as possible.
3. **Colour Clash** - identify the colour of the ink, not the word displayed on screen.

Your scores are combined into a total score. Your performance also contributes to your department's score on the public leaderboard.

---

## 1. Starting the game

Open the game home page in a modern web browser. The registration form is displayed in the centre of the page.

### Required information

#### Your name

Enter the name you want displayed on the results and public leaderboard.

- Your name is required.
- The game accepts up to 30 characters.
- Use a name that other players and organisers can recognise.

#### Your department

Choose your department from the department list.

- A department must be selected before the game can start.
- Your department determines which department receives the points from your run.
- The department list is loaded from the game database.

### Optional information

#### Mobile number

The mobile-number field is optional.

You can leave it blank if you are playing only once or do not want to use mobile-based recognition.

If you enter a mobile number:

- It can help the game recognise you when you return to retry.
- The number is normalised before it is stored. Spaces, hyphens, and parentheses are ignored.
- A valid number must contain 7 to 15 digits, with an optional leading `+`.
- Invalid values, such as letters or numbers that are too short or too long, are rejected.
- The number is private and is not shown on the public leaderboard.
- The number is not shown on the public result screen.
- Only authorised administrators can view or manage it through the admin area.

### Starting

After entering your name and selecting your department, select **Start the rush**.

The game creates or retrieves your player record and then shows the introduction for Round 1.

If you use the same mobile number on a later attempt, the game can recognise the existing player. This allows your retry to remain associated with the same player identity and public UID.

If you do not provide a mobile number, the game uses your name and department as the fallback identity information.

---

## 2. How a run works

Every run follows the same order:

1. Registration
2. Reaction
3. Tap Storm
4. Colour Clash
5. Results

Before each round, an instruction screen explains the objective. Read the instruction and select **Got it, I'm ready** when you are prepared.

The round indicator at the top shows:

- The current round number, from 1 to 3.
- Progress markers for the completed and upcoming rounds.

Once a round begins, focus on the game area. Do not refresh the page or navigate away during a run, because the current round state is held in the browser while you play.

---

## 3. Round 1: Reaction

### Objective

Wait for the game area to turn green, then tap as quickly as possible.

### Sequence

1. The round begins in a waiting state.
2. The screen changes to green after a random delay.
3. Tap the game area as soon as it turns green.
4. You receive two attempts.
5. After the second attempt, your Reaction score is calculated and the game moves to Tap Storm.

### Important rules

- Do not tap while the screen says **Wait for green...**.
- Tapping too early gives that attempt zero points.
- A successful reaction is scored from your response time in milliseconds.
- Faster responses receive more points.
- Each attempt can contribute up to 50 points.
- The two attempts are added together, so the maximum Reaction score is 100 points.

### Tips

- Keep your finger or mouse close to the game area.
- Concentrate on the colour change rather than trying to predict the timing.
- Do not repeatedly tap while waiting. An early tap is treated as a failed attempt.
- On a touch device, use a single deliberate tap instead of pressing and dragging.

---

## 4. Round 2: Tap Storm

### Objective

Tap ten orange targets that appear at changing positions inside the game area.

### Sequence

1. The first target appears inside the arena.
2. Tap the target.
3. A new target appears at another position.
4. Continue until the counter reaches 10/10.
5. Your completion time is converted into a score.

The counter shows the target currently required, for example:

```text
TAP STORM 4/10
```

### Scoring

Tap Storm rewards fast completion:

- The timer starts when the round begins.
- The game measures the time required to hit all ten targets.
- Faster completion produces a higher score.
- The score is limited to a minimum of 0 and a maximum of 100 points.
- Missing the maximum target speed does not create a negative score.

### Tips

- Scan the whole arena after every tap.
- Do not keep tapping the previous target location.
- Use a larger screen if you find the target difficult to track.
- On mobile, keep your other hand or fingers away from the screen to avoid accidental touches.
- Accuracy matters because a missed tap does not advance the counter.

---

## 5. Round 3: Colour Clash

### Objective

Select the colour of the ink used to draw the word, not the meaning of the word.

The game uses four colours:

- Red
- Blue
- Green
- Purple

For example, the screen might show the word **RED** painted in blue ink:

```text
RED
```

If the visible ink is blue, select **Blue**, even though the word says “Red”.

### Duration

Colour Clash lasts **6 seconds**.

The round ends automatically when the six-second timer expires.

### Colour combinations

The game supports every ordered combination of the four colours:

- Each of the four colours can be used as the ink colour.
- Each of the four colour names can be displayed as the word.
- Matching combinations can appear, such as the word RED painted in red ink.
- Mismatching combinations can appear, such as the word RED painted in blue ink.
- The full set contains 16 possible ink-and-word combinations.
- The combinations are shuffled for each round, so the sequence is not predictable.

### Scoring

For each answer:

- Correct answer: **+10 points**
- Incorrect answer: **-5 points**

The final Colour Clash score is limited to a minimum of 0 and a maximum of 100 points.

### Tips

- Ignore the word itself.
- Look at the actual text colour.
- Answer quickly, but avoid guessing every time.
- Train yourself to read the colour of the letters from the edges of the word.
- Remember that the button labels represent the ink colours.

---

## 6. Results screen

After Colour Clash finishes, the results screen shows:

- Your name.
- Your combined total score.
- Your public player UID.
- Individual scores for:
  - Reaction
  - Tap Storm
  - Colour Clash
- A performance title based on your total score.

The total is calculated as:

```text
Total score = Reaction + Tap Storm + Colour Clash
```

The current performance titles are:

| Total score | Title |
|---:|---|
| 240 or more | Lightning Reflexes |
| 180-239 | Sharp Shooter |
| 110-179 | Quick Hands |
| Below 110 | Warming Up |

Your result is submitted to the game server after the final round. If the result cannot be saved, the game displays an error while still showing the result that was calculated in your browser.

### Playing again

Select **Next player** to return to the registration form and start another run.

Starting again clears the current run from the screen. If you want to be recognised as the same player, enter the same mobile number again.

---

## 7. Public player UID

Each player has:

- An internal database identifier used by the application.
- A public 10-digit player UID displayed on the result screen and leaderboard data.

The public UID is safe to share as a game identity. It is separate from the internal database ID.

The public leaderboard does not display mobile numbers.

---

## 8. Leaderboard

Select the **Leaderboard** link in the top-right corner of the home page to open the dedicated leaderboard page.

The leaderboard has two sections.

### Department leaderboard

This section ranks departments by the combined best scores of their players.

For each department, it can show:

- Department rank.
- Department name.
- A relative score bar.
- Number of players.
- Average player score.
- Department total points.

The department total is based on each player's best recorded score, not the sum of every attempt they have ever made.

### Top players

This section shows up to the top ten players, ranked by best score.

For each player, it shows:

- Rank.
- Public display name.
- Department.
- Best score.

Private mobile numbers are not displayed in either leaderboard section.

The leaderboard is loaded from the server without exposing private player fields.

---

## 9. Practical playing advice

### Before you start

- Use a stable internet connection.
- Make sure your browser window is visible and focused.
- Disable anything that may cover the game area.
- Use a comfortable device and input method.
- Read the instructions before each round.

### During the run

- Do not refresh the page.
- Do not use the browser Back button.
- Do not switch tabs during a timed round.
- Keep your attention on the active game area.
- Tap once per response; repeated taps can count as early or incorrect input.

### Choosing a device

- A mouse can be effective for desktop play.
- A touchscreen can be effective for quick taps.
- A larger screen may make Tap Storm targets easier to find.
- Use a device with a responsive input surface for the most consistent experience.

---

## 10. Troubleshooting

### The department list is empty

Refresh the page and check your connection. The game loads departments from the server before registration can begin.

If the issue continues, the game database or server may be unavailable.

### The game will not start

Confirm that:

- Your name is filled in.
- A department is selected.
- The mobile number, if entered, contains a valid 7-15 digit number with an optional leading `+`.

### My mobile number was rejected

Remove unsupported characters such as letters. Spaces, hyphens, and parentheses are accepted as formatting, but the number must contain 7-15 digits.

Examples of acceptable formats include:

```text
9876543210
+91 98765 43210
(987) 654-3210
```

The exact number format accepted may depend on the validation rules configured by the game.

### My result is visible but not on the leaderboard

The score is saved after the final round. If saving fails, the result screen displays an error. Check your connection and try another run later.

### I tapped too early in Reaction

That attempt receives zero points, but you still get the remaining attempt. Wait for the green state on the next attempt.

### I cannot find the leaderboard

Return to the home page and select the **Leaderboard** link in the header. The direct route is:

```text
/leaderboard
```

---

## 11. Privacy summary

The game is designed to keep mobile numbers private:

- Mobile numbers are optional.
- They are used for returning-player recognition.
- They are not shown on public results.
- They are not shown on the public leaderboard.
- They are not included in the public score response.
- They are available only through the protected admin interface.

Your public name, department, best score, play count, and public UID may be used in the game and leaderboard experience.
