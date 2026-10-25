# ClinicCare – Clinic Appointment Booking System

A simple, modern, and responsive full-stack **Clinic Appointment Booking Website** designed as an academic mini-project. It uses only **HTML, CSS, JavaScript, Node.js, and Express.js**—no heavy frontend frameworks, no complex setup, and no database configuration headaches.

---

## 📋 Project Overview

The system allows patients to view clinic information, browse medical specialists with consultation fees, book appointments for specific dates and time slots, and manage/cancel booked appointments.

### Key Features
1. **Home Page**:
   - Navigation bar with smooth section scrolling.
   - Introduction to the clinic and emergency helpline.
   - List of available doctors with specializations, experience, working hours, and consultation fees.
   - Direct "Book Appointment" buttons that pre-select the chosen doctor.

2. **Appointment Booking**:
   - Fields: Patient Name, Phone Number, Doctor selection, Appointment Date, Time Slot, and Reason for visit.
   - **Dynamic Fee Calculator** (`public/calculator.js`): Calculates the total consultation fee and applies category discounts (e.g., Senior Citizen 15% discount, Student 10% discount).
   - Real-time success and error banners.
   - Digital printable appointment confirmation slip with booking reference ID.

3. **Appointment Management**:
   - Clean, responsive table showing all booked appointments.
   - **Status Badges**: Confirmed, Cancelled, Completed.
   - **Cancellation Support**: Allows patients to cancel an appointment and free up the slot.
   - **Validation & Duplicate Defense**:
     - Prevents selecting past dates.
     - Automatically blocks duplicate bookings for the same doctor, date, and time slot with a clear error message.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Pure HTML5, CSS3, Vanilla JavaScript |
| **Styling** | `public/style.css` (Layout, Doctors & Forms) and `public/css.css` (Tables, Badges, Alerts, Print) |
| **Logic & Types** | `public/calculator.js` (Fee & Duration Calculator), `public/types.js` (Constants & Enums) |
| **Backend** | Node.js with Express.js |
| **Data Storage** | Local JSON Database (`data/doctors.json` and `data/appointments.json`) — persists across restarts with zero external database configuration |

---

## 📂 Project Structure

```
clinic_appointment/
│
├── public/                     # Static Frontend Files
│   ├── index.html              # Main HTML webpage
│   ├── style.css               # Main stylesheet (layout, hero, doctor cards, form)
│   ├── css.css                 # Specialized stylesheet (tables, status badges, alerts, print)
│   ├── app.js                  # Browser-side JavaScript (DOM, API calls, validations)
│   ├── calculator.js           # Fee & duration calculation module
│   ├── types.js                # Shared constants, enums, and time slots
│   └── images/
│       └── logo.svg            # Clinic medical cross logo
│
├── src/
│   └── app.js                  # Express backend setup, middleware & REST API routes
│
├── data/
│   ├── doctors.json            # Persistent doctors directory
│   └── appointments.json       # Persistent booked appointments
│
├── server.js                   # Application entry point (starts Express HTTP server)
├── package.json                # Project dependencies and npm start script
├── package-lock.json           # Locked dependency tree
├── .gitignore                  # Git ignore file (excludes node_modules)
└── README.md                   # Documentation and project manual
```

---

## ⚙️ How to Install and Run the Project

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **NPM** (bundled with Node.js)

### 2. Installation
Open a terminal in the `clinic_appointment` directory and run:

```bash
npm install
```

### 3. Start the Server
Start the Express server using the standard npm script:

```bash
npm start
```

You will see output in the terminal:
```text
====================================================
 ClinicCare – Clinic Appointment Booking System
 Server is running on: http://localhost:3000
 Health Check API:    http://localhost:3000/api/health
====================================================
```

### 4. Open in Browser
Open any web browser and visit:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing the User Flows (Step-by-Step for Viva Demonstration)

1. **Browse Doctors**:
   - Scroll to the **"Our Doctors"** section.
   - Notice the cards for Dr. Sarah Jenkins (Cardiology, $80), Dr. Marcus Chen (Neurology, $95), Dr. Elena Rodriguez (Pediatrics, $60), Dr. James Wilson (Dermatology, $75), Dr. Priya Sharma (General Medicine, $45), and Dr. David Miller (Orthopedics, $90).

2. **Pre-Select Doctor**:
   - Click the **"📅 Book Appointment"** button on any doctor card (e.g., Dr. Sarah Jenkins).
   - The page smoothly scrolls to the booking form, and Dr. Sarah Jenkins is automatically selected in the dropdown.
   - The fee display box dynamically calculates and shows `$80.00`.

3. **Category Discount Calculation**:
   - Change the **Patient Category** dropdown to *"Senior Citizen (60+ yrs) - 15% Off"*.
   - Watch the fee box update dynamically via `calculator.js` to `$68.00` showing the 15% discount calculation.

4. **Book a Valid Appointment**:
   - Enter Patient Name: `Jane Doe`
   - Phone: `555-0182`
   - Pick tomorrow's date and a time slot (e.g., `10:00 AM - 10:30 AM`).
   - Enter Reason for Visit: `Regular heart health checkup`.
   - Click **"Confirm & Book Appointment"**.
   - A green success alert appears, the booking shows up in the **Booked Appointments** table, and an official **Printable Appointment Slip** pops up.

5. **Test Past Date Prevention**:
   - The date picker's minimum selectable date is automatically restricted to today (`min="YYYY-MM-DD"`).
   - The backend Express API also strictly rejects any date prior to today with a `400 Bad Request` error.

6. **Test Duplicate Booking Prevention**:
   - Without refreshing, try booking another appointment for the **same doctor**, on the **same date**, and at the **exact same time slot** (`10:00 AM - 10:30 AM`).
   - The server detects the scheduling conflict and immediately returns a red error alert:
     > *"Dr. Sarah Jenkins already has a confirmed appointment on [Date] at 10:00 AM - 10:30 AM. Please choose another time slot or another doctor."*

7. **Cancel an Appointment**:
   - In the **Booked Appointments** table, find an appointment and click **"Cancel"**.
   - Confirm the cancellation prompt.
   - The status badge updates from **Confirmed** (green) to **Cancelled** (red), freeing up that slot.

---

## 📝 College Demonstration Highlights (Viva Questions)

- **Q: Why are there two CSS files (`style.css` and `css.css`)?**
  * **A:** They have distinct responsibilities: `style.css` handles the overall responsive page layout, navigation, hero banner, doctor cards, and form styling. `css.css` handles the appointment records table, status badges, alert banners, modal slip, and print styles.
- **Q: What is the purpose of `calculator.js`?**
  * **A:** It provides a fee calculation engine that computes base fees, applies category discounts (senior citizens, students), formats currency, and calculates appointment duration.
- **Q: What is the purpose of `types.js`?**
  * **A:** It defines standard enums and constants (Appointment Statuses, Consultation Types, Time Slots) shared between the application modules.
- **Q: How does the system prevent double-booking?**
  * **A:** Both client-side logic and the Express API in `src/app.js` check whether an active (`status !== 'Cancelled'`) appointment exists for the requested doctor, date, and time. If found, it rejects the request with HTTP `409 Conflict`.
