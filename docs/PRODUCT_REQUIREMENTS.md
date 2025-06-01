# 🏠 RoomieMatch - Product Requirements Document (PRD)

**Version**: 2.0  
**Date**: May 31, 2025  
**Author**: Gary Lee  
**Status**: In Development  

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Personas & Journeys](#user-personas--journeys)
4. [Feature Specifications](#feature-specifications)
5. [Technical Architecture](#technical-architecture)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Success Metrics](#success-metrics)
8. [Appendices](#appendices)

---

## 📊 Executive Summary

**RoomieMatch** is an AI-powered roommate and housing matching platform designed to connect compatible individuals for shared living arrangements in New York City and Jersey City. The platform uses advanced compatibility algorithms to match users based on lifestyle preferences, location requirements, and budget constraints.

### Current Status
- ✅ **Phase 1 Complete**: User registration with location selection and comprehensive profile creation
- ✅ **Backend Infrastructure**: Node.js/Express API with MongoDB Atlas database
- ✅ **Deployment**: Live on Railway (backend) and GitHub Pages (frontend)
- 🎯 **Next Phase**: User dashboard and matching system implementation

---

## 🎯 Product Overview

### Vision Statement
*"Connecting compatible people for better living experiences through intelligent matching and seamless user experience."*

### Core Value Propositions
1. **Smart Compatibility Matching**: AI-driven algorithm considers lifestyle, budget, and location
2. **Comprehensive User Profiles**: Detailed preferences ensure better matches
3. **Multiple Use Cases**: Room seekers, roommate seekers, and room providers
4. **Safety & Verification**: Background checks and identity verification
5. **Seamless Experience**: Intuitive interface from search to move-in

### Target Market
- **Primary**: Young professionals (22-35) in NYC/Jersey City
- **Secondary**: Students and recent graduates
- **Geographic Focus**: Manhattan, Brooklyn, Queens, Jersey City
- **Income Range**: $40K-$150K annually

---

## 👥 User Personas & Journeys

### Persona 1: Sarah - The Room Seeker 🔍
- **Age**: 26, Marketing Professional
- **Income**: $75K/year
- **Goal**: Find an affordable room in Manhattan/Brooklyn
- **Pain Points**: High rent prices, incompatible roommates, unsafe listings
- **Journey**: Registration → Preferences → Browse rooms → Connect → Move-in

### Persona 2: Mike - The Roommate Seeker 🤝
- **Age**: 28, Software Engineer  
- **Income**: $120K/year
- **Goal**: Find someone to apartment hunt together
- **Pain Points**: Can't afford solo apartment, don't know anyone looking
- **Journey**: Registration → Preferences → Browse partners → Team up → Find place

### Persona 3: Jessica - The Room Provider 🏠
- **Age**: 30, Finance Professional
- **Income**: $95K/year
- **Goal**: Find reliable roommate for spare room
- **Pain Points**: Screening applicants, ensuring compatibility, lease coordination
- **Journey**: Registration → List room → Set criteria → Review applicants → Select

---

## 🛠️ Feature Specifications

### 🎯 1. Dashboard (Priority: HIGH)
**Purpose**: Central navigation hub and user status overview

#### Requirements:
- **Welcome Section**: Personalized greeting with user name
- **Quick Stats**: Profile completion, matches found, recent activity
- **Action Cards**: Primary CTAs based on user status
- **Navigation Menu**: Access to all platform sections
- **Activity Feed**: Recent matches, messages, profile views

#### User Stories:
- As a user, I want to see my profile completion status
- As a user, I want quick access to find matches
- As a user, I want to see recent platform activity

#### Acceptance Criteria:
- Dashboard loads in <2 seconds
- Shows accurate profile completion percentage
- Responsive design for mobile/desktop
- Clear navigation to all features

### 👤 2. Profile Management (Priority: HIGH)
**Purpose**: Complete user profile creation and editing

#### Components:
1. **Basic Information**: Name, age, occupation, contact
2. **Profile Photo**: Upload and crop functionality  
3. **About Me**: Bio, interests, lifestyle description
4. **Living Situation**: Current housing, timeline, preferences
5. **Verification**: ID, background check, references
6. **Privacy Settings**: Profile visibility controls

#### Features:
- **Profile Strength Meter**: Visual completion indicator
- **Preview Mode**: "View as others see you"
- **Photo Gallery**: Multiple photos with primary selection
- **Edit/Save States**: Toggle between view and edit modes

### 🔍 3. Matching Preferences (Priority: HIGH)
**Purpose**: Set detailed criteria for roommate compatibility

#### Categories:

##### Roommate Preferences:
- **Demographics**: Age range (18-65), gender preference
- **Occupation**: Industry types, work schedule compatibility
- **Lifestyle**: Smoking, drinking, cleanliness, social level
- **Personal**: Pet tolerance, guest policies, noise levels

##### Housing Preferences:
- **Location**: Preferred neighborhoods, commute requirements
- **Budget**: Rent range, utilities, flexibility
- **Room Type**: Private room, shared room, studio share
- **Amenities**: Must-haves vs nice-to-haves

##### Deal Breakers:
- **Hard No's**: Smoking indoors, pets, overnight guests
- **Flexibility Level**: Strict, moderate, flexible

#### Algorithm Weights:
- Location Compatibility: 30%
- Budget Alignment: 25%  
- Lifestyle Match: 25%
- Demographics: 10%
- Schedule Compatibility: 10%

### 🏡 4. My Listings (Priority: MEDIUM)
**Purpose**: Manage room listings and housing partnerships

#### Listing Types:

##### Type A: Room Available
- **Room Details**: Size, furnishing, private/shared bathroom
- **Financial**: Monthly rent, deposit, utilities included
- **Property Info**: Building amenities, neighborhood details
- **Photos**: Room, common areas, building exterior
- **Lease Terms**: Duration, flexibility, house rules

##### Type B: Looking Together  
- **Budget Planning**: Combined budget, individual contributions
- **Search Criteria**: Target areas, housing type preferences
- **Timeline**: Start date, move-in flexibility
- **Partnership Terms**: Lease responsibility, decision making

#### Management Features:
- **Listing Status**: Active, paused, filled
- **Applicant Tracking**: Interested users, application status
- **Performance Analytics**: Views, inquiries, response rates
- **Communication Tools**: Direct messaging with applicants

### 💫 5. Discover Matches (Priority: HIGH)
**Purpose**: Browse and connect with compatible roommates

#### Interface Options:

##### Card View:
```
┌─────────────────────────────────────┐
│ 🔍 Search  🔽 Filter  🔽 Sort       │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ [Photo] │ │ [Photo] │ │ [Photo] │ │
│ │ Sarah J │ │ Mike R  │ │ Emma K  │ │
│ │ 92% ★   │ │ 87% ★   │ │ 94% ★   │ │
│ │ $1,200  │ │ $1,500  │ │ $1,000  │ │
│ └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

##### List View:
- Detailed compatibility breakdown
- Key information summary
- Quick action buttons
- Compatibility reasons

#### Filtering & Sorting:
- **Match Score**: Compatibility percentage
- **Budget Range**: Price filtering
- **Location**: Distance from preferences  
- **Availability**: Move-in timeline
- **Housing Type**: Room available vs looking together
- **Verification Status**: ID verified, background checked

#### Profile Cards Include:
- **Match Percentage**: Algorithmic compatibility score
- **Key Demographics**: Age, occupation, location
- **Housing Status**: Room available/seeking partner
- **Budget Information**: Rent range or contribution
- **Compatibility Highlights**: Top 3 shared preferences
- **Verification Badges**: Trust indicators
- **Actions**: Like, pass, view profile, message

---

## 🏗️ Technical Architecture

### Current Infrastructure
- **Frontend**: React 18 + TypeScript, deployed on GitHub Pages
- **Backend**: Node.js + Express, deployed on Railway
- **Database**: MongoDB Atlas with comprehensive user schema
- **Authentication**: JWT-based with bcrypt password hashing

### Database Schema Updates Required

#### New Collections:

##### UserProfiles
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection
  bio: String,
  profilePhoto: String,
  additionalPhotos: [String],
  interests: [String],
  verificationStatus: {
    idVerified: { type: Boolean, default: false },
    backgroundCheck: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false }
  },
  profileCompletionScore: { type: Number, default: 0 },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    showLastActive: { type: Boolean, default: true }
  },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

##### MatchingPreferences
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  roommatePreferences: {
    ageRange: { min: Number, max: Number },
    genderPreference: [{ type: String, enum: ['male', 'female', 'non-binary', 'any'] }],
    occupationTypes: [String],
    lifestyleCompatibility: {
      smoking: { type: String, enum: ['no', 'sometimes', 'often', 'any'] },
      drinking: { type: String, enum: ['no', 'sometimes', 'often', 'any'] },
      cleanliness: { type: String, enum: ['very-clean', 'clean', 'moderate', 'relaxed'] },
      socialLevel: { type: String, enum: ['very-social', 'social', 'moderate', 'private'] },
      pets: { type: String, enum: ['love', 'okay', 'allergic', 'no'] },
      guestPolicy: { type: String, enum: ['frequent-ok', 'occasional-ok', 'rare-only', 'none'] }
    },
    schedulePreferences: {
      workSchedule: { type: String, enum: ['standard', 'flexible', 'night-shift', 'weekend'] },
      sleepSchedule: { type: String, enum: ['early-bird', 'normal', 'night-owl'] },
      homeFrequency: { type: String, enum: ['home-body', 'balanced', 'often-out'] }
    }
  },
  housingPreferences: {
    roomType: { type: String, enum: ['private-room', 'shared-room', 'studio-share'] },
    budgetRange: { min: Number, max: Number },
    locationFlexibility: { type: String, enum: ['strict', 'moderate', 'flexible'] },
    commuteImportance: { type: String, enum: ['critical', 'important', 'flexible'] },
    amenityPreferences: {
      laundryInUnit: { type: String, enum: ['required', 'preferred', 'optional'] },
      dishwasher: { type: String, enum: ['required', 'preferred', 'optional'] },
      parking: { type: String, enum: ['required', 'preferred', 'optional'] },
      gym: { type: String, enum: ['required', 'preferred', 'optional'] },
      outdoorSpace: { type: String, enum: ['required', 'preferred', 'optional'] }
    },
    leasePreferences: {
      duration: { type: String, enum: ['6-months', '1-year', '18-months', '2-years', 'flexible'] },
      startDate: Date,
      flexibility: { type: String, enum: ['strict', 'somewhat', 'very-flexible'] }
    }
  },
  dealBreakers: [{ type: String, enum: ['smoking-indoors', 'pets', 'overnight-guests', 'parties', 'messy', 'no-lease'] }],
  flexibilityLevel: { type: String, enum: ['very-strict', 'strict', 'moderate', 'flexible', 'very-flexible'] },
  lastUpdated: { type: Date, default: Date.now }
}
```

##### Listings
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: { type: String, enum: ['room-available', 'looking-together'], required: true },
  title: String,
  description: String,
  
  // For room-available listings
  roomDetails: {
    rent: Number,
    deposit: Number,
    utilitiesIncluded: Boolean,
    estimatedUtilities: Number,
    roomSize: String,
    furnished: Boolean,
    privateBathroom: Boolean,
    photos: [String]
  },
  
  // For looking-together listings  
  partnershipDetails: {
    totalBudget: Number,
    individualContribution: Number,
    targetAreas: [String],
    housingType: { type: String, enum: ['apartment', 'house', 'condo', 'studio'] },
    searchTimeline: String
  },
  
  location: {
    borough: String,
    neighborhood: String,
    partialAddress: String, // For privacy, not full address
    nearbyTransport: [String],
    walkToSubway: Number // minutes
  },
  
  propertyDetails: {
    buildingAmenities: [String],
    totalBedrooms: Number,
    totalBathrooms: Number,
    commonAreas: [String],
    photos: [String] // Common areas, building exterior
  },
  
  availability: {
    moveInDate: Date,
    leaseEndDate: Date,
    flexible: Boolean
  },
  
  roommateRequirements: {
    preferredAge: { min: Number, max: Number },
    genderPreference: String,
    lifestylePreferences: Object,
    dealBreakers: [String]
  },
  
  status: { type: String, enum: ['active', 'paused', 'filled', 'expired'], default: 'active' },
  applicants: [ObjectId], // Array of user IDs who applied
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

##### Matches
```javascript
{
  _id: ObjectId,
  user1Id: ObjectId,
  user2Id: ObjectId,
  compatibilityScore: Number, // 0-100
  compatibilityBreakdown: {
    locationScore: Number,
    budgetScore: Number,
    lifestyleScore: Number,
    demographicsScore: Number,
    scheduleScore: Number,
    explanations: [String] // Human-readable reasons
  },
  matchType: { type: String, enum: ['roommate-seeker', 'room-provider', 'partnership'] },
  status: { 
    type: String, 
    enum: ['potential', 'user1-liked', 'user2-liked', 'mutual', 'user1-passed', 'user2-passed'], 
    default: 'potential' 
  },
  interactions: [{
    userId: ObjectId,
    action: { type: String, enum: ['like', 'pass', 'message', 'view'] },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: Date.now }
}
```

##### Analytics (Future)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  event: String, // 'profile_view', 'match_like', 'message_sent', etc.
  metadata: Object,
  timestamp: { type: Date, default: Date.now }
}
```

### API Endpoints Required

#### User Profile Management
```
GET    /api/profile/:userId          - Get user profile
PUT    /api/profile/:userId          - Update user profile  
POST   /api/profile/photo           - Upload profile photo
DELETE /api/profile/photo/:photoId  - Delete photo
GET    /api/profile/completion      - Get completion status
```

#### Matching Preferences
```
GET    /api/preferences/:userId     - Get matching preferences
PUT    /api/preferences/:userId     - Update preferences
POST   /api/preferences/calculate   - Calculate compatibility
```

#### Listings Management
```
GET    /api/listings/user/:userId   - Get user's listings
POST   /api/listings                - Create new listing
PUT    /api/listings/:listingId     - Update listing
DELETE /api/listings/:listingId     - Delete listing
GET    /api/listings/search         - Search all listings
```

#### Matching & Discovery
```
GET    /api/matches/:userId         - Get user's matches
POST   /api/matches/calculate       - Calculate matches for user
PUT    /api/matches/:matchId        - Update match status (like/pass)
GET    /api/discover                - Get paginated match results
```

#### Dashboard & Analytics
```
GET    /api/dashboard/:userId       - Get dashboard data
GET    /api/analytics/user/:userId  - Get user analytics
POST   /api/analytics/event         - Track user event
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Create core navigation and profile management

#### Week 1: Dashboard & Navigation
- [ ] Create dashboard layout with navigation
- [ ] Implement user session management
- [ ] Add profile completion tracking
- [ ] Build responsive navigation menu

#### Week 2: Profile Management
- [ ] Design profile editing interface
- [ ] Implement photo upload functionality
- [ ] Add profile completion calculator
- [ ] Create profile preview mode

**Deliverables**:
- ✅ Working dashboard with navigation
- ✅ Complete profile management system
- ✅ Photo upload functionality
- ✅ Profile completion tracking

### Phase 2: Preferences & Algorithm (Weeks 3-4)
**Goal**: Build matching preferences and core algorithm

#### Week 3: Matching Preferences
- [ ] Design preferences form interface
- [ ] Implement multi-step preference setup
- [ ] Add deal-breakers functionality
- [ ] Create preference validation

#### Week 4: Matching Algorithm
- [ ] Implement compatibility scoring algorithm
- [ ] Add location-based matching
- [ ] Create budget compatibility logic
- [ ] Build lifestyle matching system

**Deliverables**:
- ✅ Complete preferences management
- ✅ Working compatibility algorithm
- ✅ Budget and location matching
- ✅ Lifestyle compatibility scoring

### Phase 3: Listings & Discovery (Weeks 5-6)
**Goal**: Enable room listings and match discovery

#### Week 5: Listings Management
- [ ] Create listing creation flow
- [ ] Implement photo upload for rooms
- [ ] Add listing management interface
- [ ] Build applicant tracking system

#### Week 6: Match Discovery
- [ ] Design match browsing interface
- [ ] Implement filtering and sorting
- [ ] Create detailed match view
- [ ] Add like/pass functionality

**Deliverables**:
- ✅ Room listing system
- ✅ Match discovery interface
- ✅ Filtering and sorting
- ✅ User interaction system

### Phase 4: Enhancement & Testing (Week 7)
**Goal**: Polish user experience and prepare for launch

#### Testing & Optimization
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Bug fixes and improvements

#### Launch Preparation
- [ ] Analytics implementation
- [ ] SEO optimization
- [ ] Documentation completion
- [ ] Deployment preparation

**Deliverables**:
- ✅ Fully tested platform
- ✅ Performance optimized
- ✅ Mobile-ready interface
- ✅ Launch-ready application

---

## 📊 Success Metrics

### User Engagement Metrics
- **Profile Completion Rate**: Target >85%
- **Daily Active Users**: Track weekly growth
- **Session Duration**: Target >8 minutes average
- **Feature Adoption**: Dashboard, preferences, discovery usage

### Matching Success Metrics
- **Match Quality**: User satisfaction with compatibility scores
- **Interaction Rate**: Percentage of matches that receive likes
- **Mutual Match Rate**: Both users like each other
- **Conversion Rate**: Matches that lead to actual roommate arrangements

### Platform Growth Metrics
- **New User Registration**: Weekly growth rate
- **User Retention**: 7-day and 30-day return rates
- **Geographic Expansion**: Coverage across NYC neighborhoods
- **Word-of-Mouth Growth**: Referral tracking and viral coefficient

### Business Metrics
- **Time to Match**: Average time from registration to first mutual match
- **Successful Placements**: Confirmed roommate arrangements
- **User Satisfaction**: App store ratings and feedback scores
- **Platform Scalability**: Performance under increasing user load

---

## 📎 Appendices

### A. Competitive Analysis
- **SpareRoom**: Strong in listings, weak in compatibility matching
- **Roomi**: Good verification, limited algorithm sophistication  
- **Facebook Groups**: High reach, poor user experience and safety
- **Craigslist**: Wide usage, significant safety and quality concerns

### B. Technical Considerations
- **Scalability**: Database indexing for efficient matching queries
- **Security**: User data protection and privacy compliance
- **Performance**: Image optimization and caching strategies
- **Mobile**: Progressive web app considerations

### C. Future Features (Phase 2)
- **Messaging System**: In-app chat between matched users
- **Video Calls**: Virtual apartment tours and roommate interviews
- **Background Checks**: Integrated identity and credit verification
- **Lease Management**: Digital lease signing and rent tracking
- **Community Features**: Local events and roommate groups

### D. Risk Assessment
- **Market Risk**: Competition from established platforms
- **Technical Risk**: Matching algorithm accuracy and performance
- **Regulatory Risk**: Housing discrimination laws compliance
- **User Safety Risk**: Profile verification and fraud prevention

---

**Document Control**
- **Created**: May 31, 2025
- **Last Updated**: May 31, 2025  
- **Next Review**: Weekly during development
- **Stakeholders**: Development Team, Product Owner
- **Approval**: Pending implementation kickoff