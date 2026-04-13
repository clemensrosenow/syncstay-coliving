# Technical Spec: Pod-First Booking Flow

## 1. Core State Definitions
To manage the lifecycle of a booking without a real payment gateway, we track two separate statuses: the status of the **Pod**, and the status of the **User's Membership**.

### Pod States (`pods.status`)
* **`OPEN`**: The Pod is actively accepting travelers. Its current member count is below `minOccupancy`.
* **`LOCKED`**: The Pod has reached its `minOccupancy`. The booking is confirmed. It may still accept users until `totalRooms` is reached, but the core booking is guaranteed.
* **`FULL`**: The Pod has reached its absolute maximum capacity (`totalRooms`). No one else can join.

### Membership States (`pod_members.status`)
* **`PENDING`**: The user has clicked "Commit". Their (simulated) credit card is pre-authorized, but not charged.
* **`CONFIRMED`**: The Pod hit `minOccupancy`. The user is now officially locked in.
* **`WITHDRAWN`**: The user canceled their commitment *before* the Pod locked. 

---

## 2. The Happy Path (User Flow)

1.  **Discovery:** User views the "Lisbon - October 2026" feed. They see a Pod at "The Surf Villa" (Requires 3 people to lock, 2 are currently `PENDING`).
2.  **Intent:** User clicks the **"Commit to Pod"** button.
3.  **Confirmation Modal:** A UI modal appears stating: *"You are committing to this Pod. Your card will be pre-authorized for $1,000. You will only be charged if 1 more compatible nomad joins by the deadline. If the Pod fails to fill, you pay $0."*
4.  **Action (`commitToPod`):** User clicks "Confirm". Next.js triggers a Server Action.
5.  **Database Mutation (Transaction):** * System creates a `pod_members` row for the user with status `PENDING`.
    * System counts total `PENDING` + `CONFIRMED` members. 
    * Because the count just hit 3, the system updates the `pods.status` to `LOCKED`.
    * System updates all `pod_members.status` in this Pod to `CONFIRMED`.
6.  **Success State:** User is redirected to a "Pod Locked" dashboard, showing the mock group chat.

---

## 3. Edge Cases & Handling Strategy

In a 6-hour sprint, you don't have time to build complex queueing systems. You handle edge cases strictly via **Database Constraints** and **Next.js Server Actions**.

### Edge Case 1: The "Double Booking" (Schedule Conflict)
* **The Risk:** A user commits to a Pod in Lisbon for October, and then tries to commit to a Pod in Bali for October, tying up inventory they don't intend to use.
* **The Solution:** In your `commitToPod` server action, before doing anything, query the DB: *Does this user already have an active (`PENDING` or `CONFIRMED`) membership for this specific `month`?* If yes, throw a UI Error: *"You already have an active commitment for October 2026. Please withdraw from your current Pod to join this one."*

### Edge Case 2: Overbooking (The Race Condition)
* **The Risk:** A 4-bedroom Pod has 3 people. User A and User B click "Commit" at the exact same millisecond. The database might let both in, resulting in 5 people in a 4-bedroom house.
* **The Solution:** Use a Postgres database transaction. Inside your Server Action, wrap the logic so the database checks the count and inserts the user in one locked operation. If `current_members >= totalRooms`, abort the transaction and return a UI Error: *"Sorry, the last room was just taken!"*

### Edge Case 3: Cold Feet (User Withdrawal)
* **The Risk:** A user commits to an `OPEN` Pod, but changes their mind two days later. 
* **The Solution:** Provide a "Withdraw" button on their dashboard. 
    * *Rule A:* If Pod is `OPEN`, clicking Withdraw changes their `pod_members.status` to `WITHDRAWN`. They are free to join another Pod.
    * *Rule B:* If Pod is `LOCKED` or `FULL`, the Withdraw button is disabled. (For the MVP, display a tooltip: *"This Pod is locked. Cancellations must be handled via support."*)

### Edge Case 4: The AI Steering Conflict
* **The Risk:** The AI recommends an `OPEN` pod as a 95% match, but by the time the user clicks it 10 minutes later, the pod is `FULL`.
* **The Solution:** Fail gracefully. If the Server Action rejects the join request because the pod is full, redirect the user back to the search feed with a Toast notification: *"That Pod just filled up! Here are new AI recommendations based on your profile."*

---

## 4. API Contract: The Server Action (`commitToPod`)

Here is the logical pseudo-code for the Next.js Server Action that handles the "Commit" button click. This guarantees data integrity.

```typescript
// /src/actions/booking.ts

export async function commitToPod(userId: number, podId: number) {
  // START DATABASE TRANSACTION
  return await db.transaction(async (tx) => {
    
    // 1. Fetch Pod Details
    const pod = await tx.select().from(pods).where(eq(pods.id, podId));
    
    // 2. Check if Pod is already FULL
    if (pod.status === 'FULL') {
      throw new Error("This Pod is already full.");
    }

    // 3. Prevent Double Booking
    const existingCommitment = await tx.select().from(podMembers)
      .where(and(eq(podMembers.userId, userId), eq(podMembers.month, pod.month), ne(podMembers.status, 'WITHDRAWN')));
    if (existingCommitment) {
      throw new Error("You already have a commitment for this month.");
    }

    // 4. Insert the new member as PENDING
    await tx.insert(podMembers).values({ podId, userId, status: 'PENDING' });

    // 5. Check new total occupancy
    const currentMemberCount = await tx.count(...); // Count active members in this pod

    // 6. State Machine Triggers
    if (currentMemberCount === pod.totalRooms) {
       // Max capacity reached
       await tx.update(pods).set({ status: 'FULL' }).where(eq(pods.id, podId));
       await tx.update(podMembers).set({ status: 'CONFIRMED' }).where(eq(podMembers.podId, podId));
    } 
    else if (currentMemberCount >= pod.minOccupancy && pod.status === 'OPEN') {
       // Minimum lock threshold reached!
       await tx.update(pods).set({ status: 'LOCKED' }).where(eq(pods.id, podId));
       await tx.update(podMembers).set({ status: 'CONFIRMED' }).where(eq(podMembers.podId, podId));
    }

    // COMMIT TRANSACTION
    return { success: true, newStatus: pod.status };
  });
}
```

## 5. Out of Scope for MVP (Do Not Build Today)
* **Timeouts/Expirations:** In real life, if an `OPEN` Pod doesn't hit its minimum occupancy by a certain date (e.g., 14 days before move-in), the system would automatically cancel it and refund the pre-authorizations. *Do not build this cron job today.*
* **Dynamic Room Selection:** In real life, users pick specific bedrooms (Master vs. Standard). For this prototype, a room is a room, and they are all identical.