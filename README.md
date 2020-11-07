# ga_app


## Overview

Group project for UEA MSc Computer Science software development coursework (3 Students). Website was developed over the course of about 2-3 weeks along side lectures and other assigned coursework at the time.

The task was to develop a fully functioning website designed specifcally for mobile devices that could be used by the train operator Greater Anglia to support the maintenance and care of their train fleet. The app would have to be used by GA employees to report, manage and track faults with their trains. 

All users of the app needed to be able to report a fault and recieve updates on how their request was being handled. 

Some employees then needed to be able to view and update these issues.

We then also extended this to put some basic recognition in to try and identify if a fault had already been reported before users submitted a new fault.

The main focus of the app was on the development and design rather than the functinoality. A lot of work went into the design and logic of the app in the early stages of development. 

## Dependencies

(Required)

Node.js - express, path, pg

(Optional)

Postgresql

## Usage

### To view the website:

Download code

Open terminal and navigate to ga_app directory

Run ```node express.js```

Open browser and navigate to localhost:3000

### To use with backend:

Create a new postgres database using the ga_app.sql file.

Add some test data into the database from ga_app_data.sql

Edit the database information in the top of the express.js file.

Restart server if it is already running.
