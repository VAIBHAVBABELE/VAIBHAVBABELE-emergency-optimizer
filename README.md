# emergency-optimizer

- [main page](/frontend/pages/dashboard.html)
- [drone page](/frontend/pages/drones.html)
- [offline page](/frontend/pages/offline.html)
- [prediction page](/frontend/pages/prediction.html)
- [routes page](/frontend/pages/routes.html)

-[github link](https://github.com/VAIBHAVBABELE/emergency-optimizer)

- [Ppt explain](https://drive.google.com/file/d/1lpdMWpY0hrAtfRtp1E1FuUEkacCv75h_/view?usp=drivesdk)
- [![Click to watch demo video](https://img.youtube.com/vi/Xa-vIQaAVPc/0.jpg)](https://www.youtube.com/watch?v=Xa-vIQaAVPc "Demo Video")


# Emergency Supply Optimizer 🚑🇮🇳


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org)

## Table of Contents
- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation Guide](#installation-guide)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Performance Metrics](#performance-metrics)
- [Case Studies](#case-studies)
- [Future Roadmap](#future-roadmap)
- [Team](#team)
- [License](#license)

## Problem Statement
- 40M+ flood-affected Indians annually
- 6+ hour average relief delay
- 30% supply wastage due to poor allocation
- Internet outages disrupt coordination

## Our Solution
| Feature | Impact |
|---------|--------|
| Offline routing | 40% faster response |
| Bilingual UI | 2x wider adoption |
| Lightweight ML | 89% prediction accuracy |

## Key Features
1. **Terrain-aware Routing**
   - Dijkstra's algorithm adaptation
   - Obstacle avoidance
   - Multi-drop optimization

- ![Route](/frontend/assets/images/5.png)

2. **Demand Prediction**
   - Time-series analysis
   - Population density mapping

- ![prediction](/frontend/assets/images/4.png)

3. **Offline Operation**
   - CSV data storage
   - SMS fallback

- ![offline](/frontend/assets/images/6.png)

## Technology Stack
**Frontend:**
- HTML5, Bootstrap, jQuery
- Leaflet.js

**Backend:**
- Python Flask
- Pandas, Sklearn

**Data:**
- Google Sheets API
- Offline CSV

## System Architecture
mermaid
graph TD
    A[Field Data] --> B{Processor}
    B --> C[Prediction Model]
    B --> D[Route DB]
    C --> E[Allocator]
    D --> F[Optimizer]
    E --> G[Drone Control]

## Installation Guide

    git clone https://github.com/your-repo/emergency-optimizer.git
    cd emergency-optimizer
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python app.py

## Team

    **VAIBHAV BABELE**
    **ANUPRIYA YADAV**
    **VANSH GUPTA**
    **SHIVAM KUMAR**

## some imaages

- ![dashboard](/frontend/assets/images/1.png)
- ![index](/frontend/assets/images/2.png)
- ![route](/frontend/assets/images/3.png)
