![image](https://github.com/user-attachments/assets/50885e5b-cf6a-4c11-b66b-c0e48ac8740c)

# Dottie: Your Period Bestie

## Mission
To empower adolescent girls with knowledge about their menstrual health through accessible, friendly AI-powered guidance.

## Vision
A world where young people understand their bodies, recognize menstrual health as a vital sign, and feel confident seeking care when needed.

## What is Dottie?
Dottie is an AI-powered symptom checker designed specifically for adolescent girls and their caregivers to distinguish between normal and abnormal menstruation patterns, delivered through a friendly, approachable digital mascot.

# UI Screenshots

## Authentication
**Login Screen**  
![Login Screen](https://github.com/user-attachments/assets/3d5e66b9-c662-497a-a03e-eded06cf9259)

**Signup Screen**  
![Signup Screen](https://github.com/user-attachments/assets/c22703d5-5cde-493c-b4fa-2be42252e3fe)


## Assessment
**Question Flow**  
![Question 1](https://github.com/user-attachments/assets/4d201526-47c6-4742-a1dc-8bf469e25372)
![Question 2](https://github.com/user-attachments/assets/218177ba-bf0d-47a0-9c01-472439934567)
![Question 3](https://github.com/user-attachments/assets/b567f30e-ab18-41f6-bca4-feab96ab5d7d)
![Question 4](https://github.com/user-attachments/assets/e2d6184a-4868-4a78-b6ad-b539114fae6d)
![Question 5](https://github.com/user-attachments/assets/190892a0-f62d-403a-9f03-506c979a493a)
![Question 6](https://github.com/user-attachments/assets/2e96b4e1-b35a-4576-a256-3d44650aaa33)

**Results Page**  
![Assessment Results](https://github.com/user-attachments/assets/de364e8a-16ea-4881-a136-e75d532068e5)

## AI Chat
**Chat with Dottie**  
![Chat Conversation](https://github.com/user-attachments/assets/59756778-2cfc-48fc-b864-a933b1af49cf)


## User (Profile Icon)
**Profile Overview**  
![Profile Main](https://github.com/user-attachments/assets/d1141958-a3fa-4c50-aa97-47f8e8dd7d72)

**Settings**  
![Profile Settings](https://github.com/user-attachments/assets/39378412-b8b0-4321-a8c1-57919c7cf706)


## Problem Statement

### The Challenge: Adolescent menstrual health faces three critical barriers:

1. **Knowledge Gap**: Many adolescents and caregivers lack clear understanding of what constitutes normal vs. abnormal menstruation.
2. **Communication Barrier**: Stigma and embarrassment prevent open discussions about menstrual concerns between adolescents, caregivers, and healthcare providers.
3. **Delayed Care**: Without understanding normal parameters, abnormal symptoms often go unreported, leading to delayed diagnosis of underlying conditions like PCOS, endometriosis, or thyroid disorders.

### Key Statistics:
- Up to 38% of adolescent girls experience menstrual disorders
- The average delay in diagnosis for endometriosis is 7-10 years, often beginning in adolescence
- 75% of young women report receiving inadequate education about menstrual health
- Only 14% of adolescents consult healthcare providers about menstrual concerns

This problem disproportionately affects underserved communities with limited access to specialized healthcare and comprehensive sexual health education.

## Solution: Meet Dottie

Dottie is a conversational AI assistant designed as a friendly, knowledgeable "Period Bestie" for adolescents navigating menstrual health.

### Core Features:

- **Symptom Assessment**: Evaluates menstrual patterns against age-appropriate clinical guidelines.
- **Personalized Education**: Provides developmentally appropriate explanations based on user's age and knowledge level.
- **Decision Support**: Helps determine when to seek medical attention vs. when patterns are within normal range.
- **Conversation Starters**: Provides scripts to help teens discuss concerns with parents and healthcare providers.

### Unique Approach:

- **Character-Based Interface**: Dottie's friendly mascot design reduces stigma and anxiety.
- **Medically Accurate**: Built on ACOG guidelines and reviewed by adolescent gynecologists.
- **Privacy-Centered**: Age-appropriate design with strong data protection and privacy controls.
- **Accessible Language**: Uses clear, non-clinical language with optional educational deep-dives.
- **Culturally Responsive**: Content addresses diverse cultural contexts and beliefs around menstruation.

## How Dottie Works

### User Journey:

1. **Onboarding**: Brief questionnaire establishes baseline information about age, menstrual history, and concerns.
2. **Assessment**: When users report concerns or unusual symptoms, Dottie guides them through a conversational assessment using clinically-validated questions.
3. **Personalized Guidance**:
   - **Green**: Reassurance when patterns are within normal range.
   - **Red**: Clear guidance to seek healthcare when patterns suggest potential issues.
4. **Educational Content**: Contextual information about menstrual health delivered through engaging, age-appropriate explanations.
5. **Healthcare Connection**: When needed, helps prepare for healthcare visits with symptom summaries and questions to ask.

### User Experience:
The interface balances friendly engagement with medical credibility, using accessible language while maintaining scientific accuracy.

## Datasets & Knowledge Base

### Medical Foundation:
- ACOG Committee Opinion No. 651 (2015): Core guidelines on normal menstrual parameters.
- Society for Adolescent Health and Medicine clinical recommendations.

## Development

### Project Structure
- **backend**: Express.js API server with API endpoints
- **frontend**: (Coming soon) User interface for the Dottie application

### Architecture

#### Database
Dottie uses a dual-database approach to simplify development while maintaining production readiness:

- **Development**: SQLite for local development (no setup required)
- **Production**: Azure SQL Database for scalable cloud deployment
- **ORM**: Knex.js provides a unified query interface across both database types

This architecture allows developers to work locally without needing to set up a database server, while ensuring a smooth transition to production with Azure SQL.

#### Backend
- **API Server**: Express.js handles HTTP requests and routing
- **Data Models**: Knex.js models for database interaction
- **Authentication**: (Coming soon) JWT-based authentication
- **Middleware**: Express middleware for request processing

### Backend Port Configuration & macOS Compatibility

By default, the backend runs on:

- **Port 5000** on Windows/Linux
- **Port 5001** on macOS (to avoid conflict with AirPlay)

You can override this by creating a `.env` file in `/backend`:

```env
PORT=5050
```

### Getting Started

#### Backend Setup

1. Navigate to the backend directory and install dependencies, return to root:
   ```
   cd backend; npm install; cd ..
   ```

2. Navigated to the frontend directory and build dependencies:
   ```
   cd frontend; npm install; npm run build
   ```

3. Run frontend (activates backend by itself with concurrently)
   ```
   npm run dev
   ```

### Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: SQLite (dev), Azure SQL (production)
- **ORM**: Knex.js for database queries
- **Testing**: Vitest, Supertest
- **Documentation**: Docusaurus (see `/docs` directory)

---

## 🤝 Contributing

We welcome contributions to the Dottie project!

### 🪜 How to Start:

1. Fork the repository  
2. Create a new branch: `git checkout -b feature/your-feature`  
3. Make your changes  
4. Commit: `git commit -m "Add: your feature"`  
5. Push: `git push origin feature/your-feature`  
6. Open a Pull Request 🚀

Please read our [contributing guidelines](CONTRIBUTING.md) before submitting PRs.  
> If you're new, check out [`good first issue`](https://github.com/lmcrean/dottie/labels/good%20first%20issue) to get started.

---

## License
[ISC License](LICENSE)
